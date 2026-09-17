import { Request, Response, Router } from "express";
import { ShopeeAdapter } from "../src/adapters/ShopeeAdapter.js";
import { AmazonAdapter } from "../src/adapters/AmazonAdapter.js";
import {
  MercadoLivreAdapter,
  MercadoLivreError,
} from "../src/adapters/MercadoLivreAdapter.js";
// Importe seu ORM/Banco aqui (ex: Prisma)
import { prisma } from "../src/config/prisma.js";

const router = Router();
const shopeeAdapter = new ShopeeAdapter();
const amazonAdapter = new AmazonAdapter();
const mercadoLivreAdapter = new MercadoLivreAdapter();

// Função utilitária para extrair apenas o ID do Mercado Livre (ex: MLB5008168162)
function extractMercadoLivreId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Extrai da query string (ex: ?item_id=MLB5008168162)
  const queryMatch = trimmed.match(/[?&]item_id=(MLB\d+)/i);
  if (queryMatch) return queryMatch[1].toUpperCase();

  // Extrai de URLs padrão (ex: mercadoLivre.com.br/p/MLB5008168162 ou MLB-5008168162)
  const regexMatch = trimmed.match(/(MLB-?\d+|\bMLB\d+\b)/i);
  if (regexMatch) return regexMatch[0].replace("-", "").toUpperCase();

  return null;
}

// -------------------------------------------------------------------
// POST /api/products/:id/sync - Sincronização individual de produto
// -------------------------------------------------------------------
router.post("/:id/sync", async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    // 1. Busca o produto REAL no banco de dados
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Produto não encontrado no banco de dados." });
    }

    const marketplace = product.marketplace?.toLowerCase().replace(/\s+/g, "");
    const rawExternalId = product.externalProductId;
    const identifier = product.affiliateUrl?.trim() || rawExternalId;

    if (!identifier) {
      return res
        .status(400)
        .json({ message: "Produto não possui um ID externo/link cadastrado." });
    }

    // --- INTEGRAÇÃO SHOPEE ---
    if (marketplace === "shopee") {
      let accessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
      const refreshToken = process.env.SHOPEE_REFRESH_TOKEN || "";
      let updatedData;

      try {
        updatedData = await shopeeAdapter.getItemDetail(
          rawExternalId,
          accessToken,
        );
      } catch (err: any) {
        if (
          refreshToken &&
          (err.message?.includes("invalid_access_token") ||
            err.message?.includes("token") ||
            err.message?.includes("401"))
        ) {
          const tokenResult =
            await shopeeAdapter.refreshAccessToken(refreshToken);
          process.env.SHOPEE_ACCESS_TOKEN = tokenResult.access_token;
          process.env.SHOPEE_REFRESH_TOKEN = tokenResult.refresh_token;

          accessToken = tokenResult.access_token;
          updatedData = await shopeeAdapter.getItemDetail(
            rawExternalId,
            accessToken,
          );
        } else {
          throw err;
        }
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          price: updatedData.price ?? product.price,
          availability: updatedData.inStock ? "AVAILABLE" : "UNAVAILABLE",
          priceCheckedAt: new Date(),
        },
      });

      return res.json({
        message: "Produto sincronizado com sucesso com a Shopee.",
        product: updatedProduct,
      });
    }

    // --- INTEGRAÇÃO AMAZON ---
    if (marketplace === "amazon") {
      const amazonData = await amazonAdapter.getItemDetail(rawExternalId);

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          price: amazonData.price ?? product.price,
          availability: amazonData.inStock ? "AVAILABLE" : "UNAVAILABLE",
          priceCheckedAt: new Date(),
        },
      });

      return res.json({
        message: "Produto sincronizado com sucesso com a Amazon.",
        product: updatedProduct,
      });
    }

    // --- INTEGRAÇÃO MERCADO LIVRE ---
    if (marketplace === "mercadolivre" || marketplace === "mercadolibre") {
      // Higieniza o ID antes de enviar para o adapter (ex: extrai MLB5008168162)
      const cleanMlId = extractMercadoLivreId(rawExternalId ?? "");

      if (!cleanMlId) {
        return res.status(400).json({
          message:
            "ID do Mercado Livre inválido. Use um ID no formato MLB123456789 ou uma URL que o contenha.",
        });
      }

      if (!rawExternalId?.trim()) {
        return res.status(400).json({
          message: "externalProductId é obrigatório para sincronizar o Mercado Livre.",
        });
      }

      const mlData = await mercadoLivreAdapter.fetchProductData(rawExternalId.trim());

      if (mlData.syncStatus === "skipped_third_party") {
        return res.json({
          message: "Sincronização ignorada: o anúncio pertence a um terceiro ou está bloqueado pela API.",
          product,
          syncStatus: mlData.syncStatus,
          reason: mlData.skipReason,
        });
      }

      // Atualiza os dados no banco de dados real
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          price: mlData.price ?? product.price,
          originalPrice: mlData.originalPrice ?? null,
          availability: mlData.availability,
          externalProductId: cleanMlId,
          priceCheckedAt: new Date(),
        },
      });

      return res.json({
        message: "Produto sincronizado com sucesso com o Mercado Livre.",
        product: updatedProduct,
      });
    }

    return res.json({
      message: "Produto verificado (sem integração externa ativa).",
      product,
    });
  } catch (error: any) {
    console.error("Erro na sincronização:", error);
    const statusCode =
      error instanceof MercadoLivreError &&
      error.status &&
      error.status >= 400 &&
      error.status < 500
        ? error.status
        : 500;

    return res.status(statusCode).json({
      message:
        error.message || "Erro ao sincronizar produto com o marketplace.",
    });
  }
});

// -------------------------------------------------------------------
// GET /api/products/sync-all - Sincronização em Lote (Cron)
// -------------------------------------------------------------------
router.get("/sync-all", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    // Busca todos os produtos do banco de dados real
    const products = await prisma.product.findMany();

    let shopeeAccessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
    const shopeeRefreshToken = process.env.SHOPEE_REFRESH_TOKEN || "";

    const results = {
      total: products.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const product of products) {
      const marketplace = product.marketplace
        ?.toLowerCase()
        .replace(/\s+/g, "");
      const rawExternalId = product.externalProductId;
      const identifier = product.affiliateUrl?.trim() || rawExternalId;

      if (!identifier) continue;

      try {
        if (marketplace === "shopee") {
          // Lógica da Shopee...
          results.success += 1;
        } else if (marketplace === "amazon") {
          await amazonAdapter.getItemDetail(rawExternalId);
          results.success += 1;
        } else if (
          marketplace === "mercadolivre" ||
          marketplace === "mercadolibre"
        ) {
          const cleanMlId = extractMercadoLivreId(rawExternalId ?? "");
          if (!cleanMlId) {
            results.failed += 1;
            results.errors.push(
              `Produto ID ${product.id}: ID do Mercado Livre inválido.`,
            );
            continue;
          }
          if (!rawExternalId?.trim()) {
            results.failed += 1;
            results.errors.push(
              `Produto ID ${product.id}: externalProductId é obrigatório.`,
            );
            continue;
          }

          const mlData = await mercadoLivreAdapter.fetchProductData(
            rawExternalId.trim(),
          );

          if (mlData.syncStatus === "skipped_third_party") {
            results.success += 1;
            continue;
          }

          await prisma.product.update({
            where: { id: product.id },
            data: {
              price: mlData.price ?? product.price,
              availability: mlData.availability,
              externalProductId: cleanMlId,
              priceCheckedAt: new Date(),
            },
          });
          results.success += 1;
        }
      } catch (err: any) {
        results.failed += 1;
        results.errors.push(
          `Produto ID ${product.id} (${product.marketplace}): ${err.message}`,
        );
      }
    }

    return res.json({
      message: "Sincronização em lote concluída.",
      summary: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na sincronização em lote:", error);
    return res.status(500).json({
      message: error.message || "Erro durante a sincronização em lote.",
    });
  }
});

export default router;
