export type SyncResult = {
  price: number;
  originalPrice: number | null;
  availability: "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";
  syncStatus?: "synced" | "skipped_third_party";
  skipReason?: string;
  rawResponse?: unknown;
};

export interface MarketplaceAdapter {
  /**
   * Identificador do marketplace (ex: "MERCADO_LIVRE", "AMAZON", "SHOPEE")
   */
  readonly marketplaceName: string;

  /** Busca dados usando exclusivamente o ID do produto no marketplace. */
  fetchProductData(externalProductId: string): Promise<SyncResult>;
}