import { prisma } from "../../config/prisma.js";
import { MarketplaceAdapter } from "../../adapters/MarketplaceAdapter.js";

export class SyncService {
  private adapters: Map<string, MarketplaceAdapter> = new Map();

  private normalizeMarketplace(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  }

  constructor(adapters: MarketplaceAdapter[] = []) {
    adapters.forEach((adapter) => this.registerAdapter(adapter));
  }

  public registerAdapter(adapter: MarketplaceAdapter) {
    this.adapters.set(this.normalizeMarketplace(adapter.marketplaceName), adapter);
  }

  /**
   * Sincroniza um único produto acionado pelo botão no Admin
   */
  public async syncSingleProduct(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    if (!product.externalProductId && !product.affiliateUrl) {
      throw new Error(
        "Produto não possui o ID externo (externalProductId) cadastrado.",
      );
    }

    const marketplaceKey = this.normalizeMarketplace(product.marketplace);
    const adapter = this.adapters.get(marketplaceKey);
    if (!adapter) {
      throw new Error(
        `Sincronização para o marketplace '${product.marketplace}' ainda não está implementada.`,
      );
    }

    // Chama o método nativo do adaptador existente
    if (!product.externalProductId?.trim()) {
      throw new Error(
        "Sincronização exige externalProductId; affiliateUrl não é usado como fonte de dados.",
      );
    }

    const latestData = await adapter.fetchProductData(
      product.externalProductId.trim(),
    );

    if (latestData.syncStatus === "skipped_third_party") {
      return product;
    }

    // Atualiza preço e estado no banco de dados
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        price: latestData.price,
        originalPrice: latestData.originalPrice,
        availability: latestData.availability,
        priceCheckedAt: new Date(),
      },
    });

    return updatedProduct;
  }
}
