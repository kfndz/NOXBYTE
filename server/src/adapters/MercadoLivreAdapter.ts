import { MarketplaceAdapter, SyncResult } from "./MarketplaceAdapter.js";

interface MercadoLivreItemResponse {
  id: string;
  price: number;
  original_price: number | null;
  status: string;
  status_info?: {
    status?: string;
  };
}

export class MercadoLivreAdapter implements MarketplaceAdapter {
  readonly marketplaceName = "MERCADO_LIVRE";
  private readonly baseUrl = "https://api.mercadolibre.com";

  async fetchProductData(externalProductId: string): Promise<SyncResult> {
    const formattedId = externalProductId.trim().toUpperCase();

    if (!formattedId) {
      throw new Error("ID do produto externo no Mercado Livre é inválido.");
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "NOXBYTE-Platform/1.0",
    };

    // Adiciona o token de acesso caso esteja configurado no .env
    const accessToken = process.env.MERCADO_LIVRE_ACCESS_TOKEN;
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/items/${formattedId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Produto '${formattedId}' não encontrado na API do Mercado Livre.`,
        );
      }
      throw new Error(
        `Erro ao consultar API do Mercado Livre (Status: ${response.status}).`,
      );
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