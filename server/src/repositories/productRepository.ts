import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productRelations = {
  category: true,
  subcategory: true,
};

// Trata os dados de disponibilidade e estoque para o modelo de afiliados
function sanitizeProductData(data: any) {
  const sanitized = { ...data };

  // Força a disponibilidade como AVAILABLE se vier vazia, indefinida ou UNKNOWN
  if (!sanitized.availability || sanitized.availability === "UNKNOWN") {
    sanitized.availability = "AVAILABLE";
  }

  // Força estoque positivo para a vitrine não travar a compra
  if (sanitized.stock === undefined || sanitized.stock === null || sanitized.stock <= 0) {
    sanitized.stock = 999;
  }

  return sanitized;
}

export const ProductRepository = {
  async findAll() {
    return prisma.product.findMany({
      include: productRelations,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findById(idOrSlug: string) {
    return prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: productRelations,
    });
  },

  async create(data: any) {
    const payload = sanitizeProductData(data);

    return prisma.product.create({
      data: payload,
      include: productRelations,
    });
  },

  async update(idOrSlug: string, data: any) {
    const product = await this.findById(idOrSlug);

    if (!product) {
      return null;
    }

    const payload = sanitizeProductData(data);

    return prisma.product.update({
      where: {
        id: product.id,
      },
      data: payload,
      include: productRelations,
    });
  },

  async delete(idOrSlug: string) {
    const product = await this.findById(idOrSlug);

    if (!product) {
      return null;
    }

    return prisma.product.delete({
      where: {
        id: product.id,
      },
    });
  },
};