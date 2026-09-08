import { Request, Response, Router } from "express";
import { ShopeeAdapter } from "../src/adapters/ShopeeAdapter.js";
import { AmazonAdapter } from "../src/adapters/AmazonAdapter.js";
import { MercadoLivreAdapter } from "../src/adapters/MercadoLivreAdapter.js";

const router = Router();
const shopeeAdapter = new ShopeeAdapter();
const amazonAdapter = new AmazonAdapter();
const mercadoLivreAdapter = new MercadoLivreAdapter();

// -------------------------------------------------------------------
// POST /api/products/:id/sync - Sincronização individual de produto
// -------------------------------------------------------------------
router.post("/:id/sync", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Substitua pelo produto real do seu banco de dados
    const product = {
      id,
      name: "Produto Exemplo",
      price: 100,
      marketplace: "MercadoLivre", // "Shopee", "Amazon" ou "MercadoLivre"
      externalId: "MLB123456789",
      inStock: true,
    };

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const marketplace = product.marketplace?.toLowerCase().replace(/\s+/g, "");

    // --- INTEGRAÇÃO SHOPEE ---
    if (marketplace === "shopee" && product.externalId) {
      let accessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
      const refreshToken = process.env.SHOPEE_REFRESH_TOKEN || "";
      let updatedData;

      try {
        updatedData = await shopeeAdapter.getItemDetail(
          product.externalId,
          accessToken,
        );
      } catch (err: any) {
        if (
          refreshToken &&
          (err.message?.includes("invalid_access_token") ||
            err.message?.includes("token") ||
            err.message?.includes("401"))
        ) {
          console.log("Access token expirado. Renovando token na Shopee...");

          const tokenResult = await shopeeAdapter.refreshAccessToken(refreshToken);

          process.env.SHOPEE_ACCESS_TOKEN = tokenResult.access_token;
          process.env.SHOPEE_REFRESH_TOKEN = tokenResult.refresh_token;

          accessToken = tokenResult.access_token;

          updatedData = await shopeeAdapter.getItemDetail(
            product.externalId,
            accessToken,
          );
        } else {
          throw err;
        }
      }

      const updatedProduct = {
        ...product,
        price: updatedData.price ?? product.price,
        inStock: updatedData.inStock,
        availability: updatedData.inStock ? "AVAILABLE" : "UNAVAILABLE",
        updatedAt: new Date(),
      };

      return res.json({
        message: "Produto sincronizado com sucesso com a Shopee.",
        product: updatedProduct,
      });
    }

    // --- INTEGRAÇÃO AMAZON ---
    if (marketplace === "amazon" && product.externalId) {
      const amazonData = await amazonAdapter.getItemDetail(product.externalId);

      const updatedProduct = {
        ...product,
        price: amazonData.price ?? product.price,
        inStock: amazonData.inStock,
        availability: amazonData.inStock ? "AVAILABLE" : "UNAVAILABLE",
        updatedAt: new Date(),
      };

      return res.json({
        message: "Produto sincronizado com sucesso com a Amazon.",
        product: updatedProduct,
      });
    }

    // --- INTEGRAÇÃO MERCADO LIVRE ---
    if ((marketplace === "mercadolivre" || marketplace === "mercadolibre") && product.externalId) {
      // Chamada atualizada para utilizar fetchProductData
      const mlData = await mercadoLivreAdapter.fetchProductData(product.externalId);

      const updatedProduct = {
        ...product,
        price: mlData.price ?? product.price,
        inStock: mlData.availability === "AVAILABLE",
        availability: mlData.availability,
        updatedAt: new Date(),
      };

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
    return res.status(500).json({
      message: error.message || "Erro ao sincronizar produto com o marketplace.",
    });
  }
});

// -------------------------------------------------------------------
// GET /api/products/sync-all - Sincronização em Lote (Disparada pelo Vercel Cron)
// -------------------------------------------------------------------
router.get("/sync-all", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    // TODO: Substitua pela busca do seu banco de dados
    const products = [
      {
        id: "1",
        name: "Produto Shopee",
        price: 100,
        marketplace: "Shopee",
        externalId: "12345678",
      },
      {
        id: "2",
        name: "Produto Amazon",
        price: 250,
        marketplace: "Amazon",
        externalId: "SKU-AMAZON-001",
      },
      {
        id: "3",
        name: "Produto Mercado Livre",
        price: 180,
        marketplace: "MercadoLivre",
        externalId: "MLB987654321",
      },
    ];

    let shopeeAccessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
    const shopeeRefreshToken = process.env.SHOPEE_REFRESH_TOKEN || "";

    const results = {
      total: products.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const product of products) {
      const marketplace = product.marketplace?.toLowerCase().replace(/\s+/g, "");

      try {
        if (marketplace === "shopee" && product.externalId) {
          let updatedData;
          try {
            updatedData = await shopeeAdapter.getItemDetail(
              product.externalId,
              shopeeAccessToken,
            );
          } catch (err: any) {
            if (
              shopeeRefreshToken &&
              (err.message?.includes("invalid_access_token") ||
                err.message?.includes("token") ||
                err.message?.includes("401"))
            ) {
              const tokenResult = await shopeeAdapter.refreshAccessToken(shopeeRefreshToken);
              process.env.SHOPEE_ACCESS_TOKEN = tokenResult.access_token;
              process.env.SHOPEE_REFRESH_TOKEN = tokenResult.refresh_token;
              shopeeAccessToken = tokenResult.access_token;

              updatedData = await shopeeAdapter.getItemDetail(
                product.externalId,
                shopeeAccessToken,
              );
            } else {
              throw err;
            }
          }
          results.success += 1;
        } else if (marketplace === "amazon" && product.externalId) {
          await amazonAdapter.getItemDetail(product.externalId);
          results.success += 1;
        } else if ((marketplace === "mercadolivre" || marketplace === "mercadolibre") && product.externalId) {
          // Chamada atualizada para utilizar fetchProductData
          await mercadoLivreAdapter.fetchProductData(product.externalId);
          results.success += 1;
        }
      } catch (err: any) {
        results.failed += 1;
        results.errors.push(`Produto ID ${product.id} (${product.marketplace}): ${err.message}`);
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