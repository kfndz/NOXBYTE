import { MarketplaceAdapter, SyncResult } from "./MarketplaceAdapter.js";

interface MercadoLivreItemResponse {
  id: string;
  price: number;
  original_price: number | null;
  status: string;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

export class MercadoLivreAdapter implements MarketplaceAdapter {
  readonly marketplaceName = "MERCADO_LIVRE";
  private readonly baseUrl = "https://api.mercadolibre.com";

  private async refreshAccessToken(): Promise<string> {
    const clientId = process.env.MERCADO_LIVRE_CLIENT_ID;
    const clientSecret = process.env.MERCADO_LIVRE_CLIENT_SECRET;
    const refreshToken = process.env.MERCADO_LIVRE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        "MERCADO_LIVRE_ACCESS_TOKEN expirado e credenciais de renovação não configuradas.",
      );
    }

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Token do Mercado Livre expirado. Por favor, reautentique no painel.");
    }

    const data = (await response.json()) as RefreshTokenResponse;
    process.env.MERCADO_LIVRE_ACCESS_TOKEN = data.access_token;

    if (data.refresh_token) {
      process.env.MERCADO_LIVRE_REFRESH_TOKEN = data.refresh_token;
    }

    return data.access_token;
  }

  async fetchProductData(externalProductId: string): Promise<SyncResult> {
    const formattedId = externalProductId.trim().toUpperCase();

    if (!formattedId) {
      throw new Error("ID do produto externo no Mercado Livre é inválido.");
    }

    let accessToken = process.env.MERCADO_LIVRE_ACCESS_TOKEN;

    if (!accessToken) {
      accessToken = await this.refreshAccessToken();
    }

    let response = await fetch(`${this.baseUrl}/items/${formattedId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "NOXBYTE-Platform/1.0",
      },
    });

    // Tenta renovar caso ocorra 401
    if (response.status === 401) {
      accessToken = await this.refreshAccessToken();
      response = await fetch(`${this.baseUrl}/items/${formattedId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "NOXBYTE-Platform/1.0",
        },
      });
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Produto '${formattedId}' não encontrado. Verifique se o externalProductId do produto no banco é um ID válido do Mercado Livre (ex: MLB123456789).`,
        );
      }
      throw new Error(`Erro ao consultar API do Mercado Livre (Status: ${response.status}).`);
    }

    const data = (await response.json()) as MercadoLivreItemResponse;

    let availability: SyncResult["availability"] = "UNKNOWN";
    if (data.status === "active") {
      availability = "AVAILABLE";
    } else if (data.status === "paused" || data.status === "closed") {
      availability = "UNAVAILABLE";
    }

    return {
      price: data.price,
      originalPrice: data.original_price ?? null,
      availability,
      rawResponse: data,
    };
  }
}