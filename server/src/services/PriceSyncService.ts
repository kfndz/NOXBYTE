import { MarketplaceAdapter } from "../adapters/MarketplaceAdapter.js";
import { MercadoLivreAdapter } from "../adapters/MercadoLivreAdapter.js";
import { ProductRepository } from "../repositories/productRepository.js";
import { ProductService } from "./ProductService.js";

export class PriceSyncService {
  private adapters: Map<string, MarketplaceAdapter> = new Map();

  constructor() {
    // Registra os adapters disponíveis
    this.registerAdapter(new MercadoLivreAdapter());
  }

  /**
   * Registra dinamicamente novos adaptadores de marketplace.
   */
  public registerAdapter(adapter: MarketplaceAdapter): void {
    const key = adapter.marketplaceName.trim().toUpperCase();
    this.adapters.set(key, adapter);
  }

  /**
   * Normaliza strings de identificação do marketplace para a chave do mapa.
   */
  private normalizeMarketplaceKey(marketplace: string): string {
    const cleaned = marketplace
      .trim()
      .toUpperCase()
      .replace(/[\s_-]+/g, "_");

    if (cleaned.includes("MERCADO") || cleaned === "ML") {
      return "MERCADO_LIVRE";
    }

    return cleaned;
  }

  /**
   * Executa a sincronização manual do produto por ID ou Slug.
   */
  async syncProductById(idOrSlug: string) {
    const product = await ProductRepository.findById(idOrSlug);

    if (!product) {
      throw new Error("Produto não encontrado para sincronização.");
    }

    if (!product.externalProductId?.trim() && !product.affiliateUrl?.trim()) {
      throw new Error(
        `O produto '${product.name}' não possui um externalProductId (ex: MLB123456) cadastrado.`,
      );
    }

    const marketplaceKey = this.normalizeMarketplaceKey(product.marketplace);
    const adapter = this.adapters.get(marketplaceKey);

    if (!adapter) {
      throw new Error(
        `Nenhum adaptador configurado para o marketplace '${product.marketplace}'.`,
      );
    }

    // Consulta os dados atualizados no marketplace
    if (!product.externalProductId?.trim()) {
      throw new Error(
        "Sincronização exige externalProductId; affiliateUrl não é usado como fonte de dados.",
      );
    }

    const syncedData = await adapter.fetchProductData(
      product.externalProductId.trim(),
    );

    if (syncedData.syncStatus === "skipped_third_party") {
      return product;
    }

    // Atualiza o produto via ProductService mantendo os dados higienizados e validados
    const updatedProduct = await ProductService.update(product.id, {
      price: syncedData.price,
      originalPrice: syncedData.originalPrice,
      availability: syncedData.availability,
      priceCheckedAt: new Date(),
    });

    return updatedProduct;
  }
}

// Instância única para reuso na aplicação
export const priceSyncService = new PriceSyncService();
