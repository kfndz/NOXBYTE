export interface AmazonSyncResult {
  price?: number;
  stock?: number;
  inStock?: boolean;
  status?: string;
  raw?: any;
}

export interface AmazonLWATokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class AmazonAdapter {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private regionUrl: string;

  constructor() {
    this.clientId = process.env.AMAZON_LWA_CLIENT_ID || "";
    this.clientSecret = process.env.AMAZON_LWA_CLIENT_SECRET || "";
    this.refreshToken = process.env.AMAZON_REFRESH_TOKEN || "";
    // Endpoint para América do Norte e Brasil (Na-prod)
    this.regionUrl =
      process.env.AMAZON_SP_API_BASE_URL || "https://sellingpartnerapi-na.amazon.com";
  }

  /**
   * Obtém o Access Token LWA (Login with Amazon) usando o Refresh Token
   */
  async getLWAAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error(
        "Credenciais da Amazon SP-API não configuradas no arquivo .env",
      );
    }

    const response = await fetch("https://api.amazon.com/auth/o2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao obter token LWA da Amazon: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as AmazonLWATokenResponse;
    return data.access_token;
  }

  /**
   * Obtém detalhes de oferta/preço/estoque pelo SKU do vendedor ou ASIN
   * @param sellerSku SKU do produto cadastrado na Amazon Seller Central
   * @param marketplaceId ID do Marketplace (padrão Brasil: A2Q3Y263D00KWC)
   */
  async getItemDetail(
    sellerSku: string,
    marketplaceId = process.env.AMAZON_MARKETPLACE_ID || "A2Q3Y263D00KWC",
  ): Promise<AmazonSyncResult> {
    const accessToken = await this.getLWAAccessToken();
    const sellerId = process.env.AMAZON_SELLER_ID || "";

    // Endpoint da SP-API Listings Items (V2021-08-01)
    const path = `/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(
      sellerSku,
    )}`;
    const queryParams = new URLSearchParams({
      marketplaceIds: marketplaceId,
      includedData: "summaries,offers,fulfillmentAvailability",
    });

    const response = await fetch(`${this.regionUrl}${path}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na SP-API da Amazon: ${response.statusText}`);
    }

    const data = await response.json();

    // Extrai informações de preço e estoque da resposta da SP-API
    const summary = data.summaries?.[0];
    const offer = data.offers?.[0];
    const availability = data.fulfillmentAvailability?.[0];

    const currentPrice =
      offer?.price?.listingAmount?.amount ?? summary?.price?.amount ?? 0;
    const totalStock = availability?.quantity ?? 0;

    return {
      price: currentPrice,
      stock: totalStock,
      inStock: totalStock > 0,
      status: summary?.status,
      raw: data,
    };
  }
}