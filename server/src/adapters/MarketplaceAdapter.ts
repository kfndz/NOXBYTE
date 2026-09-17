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

  /** Busca dados atualizados usando o ID do marketplace ou a URL de afiliado. */
  fetchProductData(identifier: string, fallbackIdentifier?: string): Promise<SyncResult>;
}