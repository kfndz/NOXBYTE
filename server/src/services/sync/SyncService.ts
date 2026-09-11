import { prisma } from "../../config/prisma.js";
import { MarketplaceAdapter } from "../../adapters/MarketplaceAdapter.js";

export class SyncService {
  private adapters: Map<string, MarketplaceAdapter> = new Map();

  constructor(adapters: MarketplaceAdapter[] = []) {
    adapters.forEach((adapter) => this.adapters.set(adapter.marketplaceName, adapter));
  }

  public registerAdapter(adapter: MarketplaceAdapter) {
    this.adapters.set(adapter.marketplaceName, adapter);
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

    if (!product.externalProductId) {
      throw new Error("Produto não possui o ID externo (externalProductId) cadastrado.");
    }

    const adapter = this.adapters.get(product.marketplace);
    if (!adapter) {
      throw new Error(`Sincronização para o marketplace '${product.marketplace}' ainda não está implementada.`);
    }

    // Chama o método nativo do adaptador existente
    const latestData = await adapter.fetchProductData(product.externalProductId);

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