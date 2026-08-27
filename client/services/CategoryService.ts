import type { Category } from "@/types/category";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const response = await fetch("/api/categories");

    if (!response.ok) {
      throw new Error("Não foi possível carregar as categorias.");
    }

    const result = (await response.json()) as ApiResponse<Category[]>;

    if (!result.success) {
      throw new Error(
        result.message ?? "Não foi possível carregar as categorias.",
      );
    }

    return result.data;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const response = await fetch(
      `/api/categories/${encodeURIComponent(slug)}`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Não foi possível carregar a categoria.");
    }

    const result = (await response.json()) as ApiResponse<Category>;

    if (!result.success) {
      throw new Error(
        result.message ?? "Não foi possível carregar a categoria.",
      );
    }

    return result.data;
  },
};