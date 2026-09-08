export type SyncResult = {
  price: number;
  originalPrice: number | null;
  availability: "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";
  rawResponse?: unknown;
};

export interface MarketplaceAdapter {
  /**
   * Identificador do marketplace (ex: "MERCADO_LIVRE", "AMAZON", "SHOPEE")
   */
  readonly marketplaceName: string;

  /**
   * Busca as informações atualizadas do produto na API oficial do marketplace.
   * @param externalProductId ID do produto no marketplace (ex: MLB123456789)
   */
  fetchProductData(externalProductId: string): Promise<SyncResult>;
}