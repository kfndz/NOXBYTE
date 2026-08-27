import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  externalProductId: z.string().trim().optional().nullable(),
  priceCheckedAt: z.string().datetime().optional().nullable(),
  availability: z
    .enum(["AVAILABLE", "UNAVAILABLE", "UNKNOWN"])
    .optional(),
  stock: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
  badge: z.string().optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
});

export const updateProductSchema = productSchema.partial();
