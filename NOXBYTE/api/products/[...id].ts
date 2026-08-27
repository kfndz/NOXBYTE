import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAdminToken } from "../_lib/auth.js";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeAvailability(
  value: unknown,
): "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN" {
  const availability = String(value ?? "UNKNOWN")
    .trim()
    .toUpperCase();

  if (
    availability !== "AVAILABLE" &&
    availability !== "UNAVAILABLE" &&
    availability !== "UNKNOWN"
  ) {
    throw new Error("Disponibilidade inválida.");
  }

  return availability;
}

function normalizePriceCheckedAt(value: unknown) {
  if (!value) {
    return new Date();
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error("Data de conferência do preço inválida.");
  }

  return date;
}

function normalizeNonNegativeNumber(value: unknown, fieldName: string) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} inválido.`);
  }

  return numberValue;
}

function normalizeAffiliateUrl(value: unknown) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new Error("Link de afiliado é obrigatório.");
  }

  try {
    const url = new URL(normalized);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error(
      "O link de afiliado deve ser uma URL HTTP ou HTTPS válida.",
    );
  }

  return normalized;
}

async function findProduct(idOrSlug: string) {
  return prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      category: true,
      subcategory: true,
    },
  });
}

async function resolveCategoryId(categoryIdOrSlug: string) {
  const category =
    (await prisma.category.findUnique({ where: { id: categoryIdOrSlug } })) ??
    (await prisma.category.findUnique({ where: { slug: categoryIdOrSlug } }));

  if (!category) throw new Error("Categoria inválida.");

  return category.id;
}

async function resolveSubcategoryId(
  subcategoryIdOrSlug: string | null | undefined,
  categoryId: string,
) {
  if (!subcategoryIdOrSlug?.trim()) return null;

  const subcategory =
    (await prisma.subcategory.findUnique({
      where: { id: subcategoryIdOrSlug },
    })) ??
    (await prisma.subcategory.findFirst({
      where: {
        slug: subcategoryIdOrSlug,
        categoryId,
      },
    }));

  if (!subcategory) throw new Error("Subcategoria inválida.");

  return subcategory.id;
}

async function prepareProductData(body: any, existingProduct: any) {
  const categoryInput = body.categoryId ?? existingProduct.categoryId;
  const categoryId = await resolveCategoryId(String(categoryInput));

  const subcategoryInput =
    body.subcategoryId !== undefined
      ? body.subcategoryId
      : existingProduct.subcategoryId;

  const subcategoryId = await resolveSubcategoryId(
    subcategoryInput ? String(subcategoryInput) : null,
    categoryId,
  );

  const name = String(body.name ?? existingProduct.name).trim();

  if (!name) throw new Error("Nome do produto é obrigatório.");

  const price = normalizeNonNegativeNumber(
    body.price ?? existingProduct?.price ?? 0,
    "Preço",
  );

  const originalPriceInput =
    body.originalPrice !== undefined
      ? body.originalPrice
      : existingProduct?.originalPrice;

  const originalPrice =
    originalPriceInput === undefined ||
    originalPriceInput === null ||
    originalPriceInput === ""
      ? null
      : normalizeNonNegativeNumber(originalPriceInput, "Preço original");

  if (originalPrice !== null && originalPrice < price) {
    throw new Error("O preço original não pode ser menor que o preço atual.");
  }

  const affiliateUrl = normalizeAffiliateUrl(
    body.affiliateUrl ?? existingProduct?.affiliateUrl,
  );

  const marketplace = String(
    body.marketplace ?? existingProduct.marketplace,
  ).trim();

  const image = String(body.image ?? existingProduct.image).trim();

  if (!marketplace) throw new Error("Marketplace é obrigatório.");
  if (!image) throw new Error("Imagem é obrigatória.");

  return {
    name,
    slug:
      String(body.slug ?? existingProduct.slug ?? "").trim() ||
      createSlug(name),
    description:
      body.description !== undefined
        ? body.description
          ? String(body.description).trim()
          : null
        : existingProduct.description,
    brand:
      body.brand !== undefined
        ? body.brand
          ? String(body.brand).trim()
          : null
        : existingProduct.brand,
    price,
    originalPrice,
    affiliateUrl,
    marketplace,
    externalProductId:
      body.externalProductId !== undefined
        ? normalizeOptionalString(body.externalProductId)
        : (existingProduct?.externalProductId ?? null),
    priceCheckedAt:
      body.priceCheckedAt !== undefined
        ? normalizePriceCheckedAt(body.priceCheckedAt)
        : (existingProduct?.priceCheckedAt ?? new Date()),
    availability:
      body.availability !== undefined
        ? normalizeAvailability(body.availability)
        : normalizeAvailability(existingProduct?.availability ?? "UNKNOWN"),
    image,
    rating:
      body.rating !== undefined
        ? body.rating === null || body.rating === ""
          ? 0
          : Number(body.rating)
        : existingProduct.rating,
    reviewCount:
      body.reviewCount !== undefined
        ? body.reviewCount === null || body.reviewCount === ""
          ? 0
          : Number(body.reviewCount)
        : existingProduct.reviewCount,
    stock: Number(body.stock ?? existingProduct.stock ?? 0),
    featured:
      body.featured !== undefined
        ? Boolean(body.featured)
        : existingProduct.featured,
    isOffer:
      body.isOffer !== undefined
        ? Boolean(body.isOffer)
        : existingProduct.isOffer,
    isBestSeller:
      body.isBestSeller !== undefined
        ? Boolean(body.isBestSeller)
        : existingProduct.isBestSeller,
    badge:
      body.badge !== undefined
        ? body.badge
          ? String(body.badge).trim()
          : null
        : existingProduct.badge,
    categoryId,
    subcategoryId,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = String(req.query.id ?? "");

    if (!id) {
      return res.status(400).json({
        message: "ID do produto não informado.",
      });
    }

    const existingProduct = await findProduct(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Produto não encontrado.",
      });
    }

    if (req.method === "GET") {
      return res.status(200).json(existingProduct);
    }

    if (req.method === "PUT") {
      requireAdminToken(req);

      const data = await prepareProductData(req.body, existingProduct);

      const product = await prisma.product.update({
        where: {
          id: existingProduct.id,
        },
        data,
        include: {
          category: true,
          subcategory: true,
        },
      });

      return res.status(200).json(product);
    }

    if (req.method === "DELETE") {
      requireAdminToken(req);

      await prisma.product.delete({
        where: {
          id: existingProduct.id,
        },
      });

      return res.status(204).send("");
    }

    return res.status(405).json({
      message: "Método não permitido.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao processar produto.";

    if (message === "UNAUTHORIZED") {
      return res.status(401).json({
        message: "Token de autenticação não enviado ou inválido.",
      });
    }

    if (message === "FORBIDDEN") {
      return res.status(403).json({
        message: "Acesso negado.",
      });
    }

    return res.status(400).json({ message });
  }
}
