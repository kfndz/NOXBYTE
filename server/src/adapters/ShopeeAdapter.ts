import crypto from "node:crypto";

export interface ShopeeSyncResult {
  price?: number;
  stock?: number;
  inStock?: boolean;
  itemStatus?: string;
  raw?: any;
}

export interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  error?: string;
  message?: string;
}

export class ShopeeAdapter {
  private partnerId: number;
  private partnerKey: string;
  private shopId: number;
  private baseUrl: string;

  constructor() {
    this.partnerId = Number(process.env.SHOPEE_PARTNER_ID || 0);
    this.partnerKey = process.env.SHOPEE_PARTNER_KEY || "";
    this.shopId = Number(process.env.SHOPEE_SHOP_ID || 0);
    this.baseUrl =
      process.env.SHOPEE_BASE_URL || "https://partner.shopeemobile.com";
  }

  /**
   * Gera a assinatura HMAC-SHA256 exigida pela V2 API da Shopee
   */
  private generateSignature(
    path: string,
    timestamp: number,
    accessToken = "",
  ): string {
    const baseString = `${this.partnerId}${path}${timestamp}${accessToken}${this.shopId}`;
    return crypto
      .createHmac("sha256", this.partnerKey)
      .update(baseString)
      .digest("hex");
  }

  /**
   * Renova o access_token usando o refresh_token (OAuth2 Shopee V2)
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<ShopeeTokenResponse> {
    const path = "/api/v2/auth/access_token/get";
    const timestamp = Math.floor(Date.now() / 1000);

    // Na rota de auth/access_token, a assinatura não inclui accessToken e shopId no baseString
    const baseString = `${this.partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac("sha256", this.partnerKey)
      .update(baseString)
      .digest("hex");

    const queryParams = new URLSearchParams({
      partner_id: String(this.partnerId),
      timestamp: String(timestamp),
      sign,
    });

    const body = {
      refresh_token: refreshToken,
      partner_id: this.partnerId,
      shop_id: this.shopId,
    };

    const response = await fetch(`${this.baseUrl}${path}?${queryParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Erro ao renovar token Shopee: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(
        `Erro OAuth Shopee: ${data.message || data.error}`,
      );
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
    };
  }

  /**
   * Busca as informações atualizadas do item na Shopee
   */
  async getItemDetail(
    shopeeItemId: number | string,
    accessToken: string,
  ): Promise<ShopeeSyncResult> {
    if (!this.partnerId || !this.partnerKey || !this.shopId) {
      throw new Error(
        "Credenciais da Shopee não configuradas no arquivo .env",
      );
    }

    const path = "/api/v2/product/get_item_base_info";
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = this.generateSignature(path, timestamp, accessToken);

    const queryParams = new URLSearchParams({
      partner_id: String(this.partnerId),
      timestamp: String(timestamp),
      access_token: accessToken,
      shop_id: String(this.shopId),
      sign,
      item_id_list: String(shopeeItemId),
    });

    const response = await fetch(`${this.baseUrl}${path}?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro de comunicação com a Shopee: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Shopee API Error: ${data.message || data.error}`);
    }

    const item = data.response?.item_list?.[0];

    if (!item) {
      throw new Error("Produto não encontrado na base de dados da Shopee.");
    }

    let totalStock = 0;
    if (item.has_model && item.model_list) {
      totalStock = item.model_list.reduce(
        (acc: number, model: any) =>
          acc +
          (model.stock_info_v2?.summary_info?.total_available_stock || 0),
        0,
      );
    } else {
      totalStock =
        item.stock_info_v2?.summary_info?.total_available_stock ??
        item.stock_info ??
        0;
    }

    const currentPrice =
      item.price_info?.[0]?.current_price ?? item.price ?? 0;

    return {
      price: currentPrice,
      stock: totalStock,
      inStock: totalStock > 0 && item.item_status === "NORMAL",
      itemStatus: item.item_status,
      raw: item,
    };
  }
}