import type { Product } from "@/types/product";

export type ProductFilterState = {
  categories: string[];
  priceRange: {
    min: number | "";
    max: number | "";
  };
  minRating: number;
};

export type ProductFilters = ProductFilterState;

export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  categories: [],
  priceRange: {
    min: "",
    max: "",
  },
  minRating: 0,
};

export function filterProducts(
  products: Product[],
  filters: ProductFilterState,
  searchTerm = "",
): Product[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  const minimumPrice =
    filters.priceRange.min === "" ? 0 : filters.priceRange.min;

  const maximumPrice =
    filters.priceRange.max === ""
      ? Number.POSITIVE_INFINITY
      : filters.priceRange.max;

  return products.filter((product) => {
    const price = Number(product.price ?? 0);
    const rating = Number(product.rating ?? 0);
    const category = product.category ?? "";

    const matchesCategory =
      filters.categories.length === 0 || filters.categories.includes(category);

    const matchesPrice = price >= minimumPrice && price <= maximumPrice;

    const matchesRating = filters.minRating === 0 || Math.floor(rating) === filters.minRating;

    const matchesSearch =
      normalizedTerm.length === 0 ||
      [
        product.name,
        product.description,
        product.brand,
        product.category,
        product.subcategory,
        product.marketplace,
      ]
        .filter(
          (value): value is string =>
            value !== null && value !== undefined && value !== "",
        )
        .some((value) => value.toLowerCase().includes(normalizedTerm));

    return matchesCategory && matchesPrice && matchesRating && matchesSearch;
  });
}
