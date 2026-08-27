import { useCallback, useEffect, useState } from "react";

import { CategoryService } from "@/services/CategoryService";
import type { Category } from "@/types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await CategoryService.getAll();

      setCategories(data);
    } catch (err) {
      setCategories([]);

      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar categorias.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    categories,
    loading,
    error,
    refresh,
  };
}