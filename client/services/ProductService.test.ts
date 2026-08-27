import { beforeEach, describe, expect, it, vi } from "vitest";

function createStorage() {
  const map = new Map<string, string>();

  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
    removeItem(key: string) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    get length() {
      return map.size;
    },
  };
}

describe("ProductService", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: createStorage(),
      configurable: true,
    });

    vi.resetModules();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("busca produtos da API e normaliza os dados", async () => {
    const mockProduct = {
      id: "1",
      name: "Produto Teste",
      price: "99.90",
      originalPrice: "129.90",
      rating: "4.5",
      reviewCount: 10,
      stock: 5,
      availability: "AVAILABLE",
      image: "/produto.jpg",
      images: [{ url: "/produto.jpg" }],
      category: {
        id: "cat-1",
        name: "Tecnologia",
        slug: "tecnologia",
      },
      subcategory: {
        id: "sub-1",
        name: "Smartphones",
        slug: "smartphones",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([mockProduct]), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ),
    );

    const { ProductService } = await import("./ProductService");

    const products = await ProductService.getAll();

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe("1");
    expect(products[0].price).toBe(99.9);
    expect(products[0].rating).toBe(4.5);
    expect(products[0].reviews).toBe(10);
    expect(products[0].category).toBe("tecnologia");
    expect(products[0].subcategory).toBe("smartphones");

    expect(fetch).toHaveBeenCalledWith(
      "/api/products",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });
});