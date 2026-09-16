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

export type MercadoLivreTokenPersistence = (tokens: {
  accessToken: string;
  refreshToken?: string;
}) => Promise<void> | void;

export class MercadoLivreError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "MercadoLivreError";
  }
}

export class MercadoLivreAdapter implements MarketplaceAdapter {
  readonly marketplaceName = "MERCADO_LIVRE";
  private readonly baseUrl = "https://api.mercadolibre.com";
  private refreshPromise?: Promise<string>;

  constructor(private readonly persistTokens?: MercadoLivreTokenPersistence) {}

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.requestNewAccessToken();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = undefined;
    }
  }

  private async requestNewAccessToken(): Promise<string> {
    const clientId = process.env.MERCADO_LIVRE_CLIENT_ID;
    const clientSecret = process.env.MERCADO_LIVRE_CLIENT_SECRET;
    const refreshToken = process.env.MERCADO_LIVRE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        "Credenciais do Mercado Livre ausentes no .env (MERCADO_LIVRE_CLIENT_ID, MERCADO_LIVRE_CLIENT_SECRET, MERCADO_LIVRE_REFRESH_TOKEN).",
      );
    }

    console.info("[MercadoLivreAdapter] Renovando access token OAuth...");

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[MercadoLivreAdapter] Erro ao renovar token:", errText);
      throw new MercadoLivreError(
        "Não foi possível renovar o token do Mercado Livre. O REFRESH_TOKEN pode ter expirado ou ser inválido.",
        response.status,
      );
    }

    const data = (await response.json()) as RefreshTokenResponse;

    if (!data.access_token) {
      throw new MercadoLivreError(
        "A resposta OAuth do Mercado Livre não contém access_token.",
      );
    }

    process.env.MERCADO_LIVRE_ACCESS_TOKEN = data.access_token;
    if (data.refresh_token) {
      process.env.MERCADO_LIVRE_REFRESH_TOKEN = data.refresh_token;
    }

    if (this.persistTokens) {
      try {
        await this.persistTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        });
      } catch (error) {
        console.error(
          "[MercadoLivreAdapter] Token renovado, mas não persistido:",
          error,
        );
      }
    } else if (data.refresh_token) {
      console.warn(
        "[MercadoLivreAdapter] O Mercado Livre rotacionou o refresh_token; ele foi atualizado apenas em memória.",
      );
    }

    return data.access_token;
  }

  async fetchProductData(externalProductId: string): Promise<SyncResult> {
    const formattedId = externalProductId
      .trim()
      .toUpperCase()
      .replace(/^MLB-/, "MLB");

    if (!/^MLB\d+$/.test(formattedId)) {
      throw new MercadoLivreError(
        "ID do produto externo no Mercado Livre é inválido. Use o formato MLB123456789.",
        400,
      );
    }

    let accessToken = process.env.MERCADO_LIVRE_ACCESS_TOKEN;

    // 1. Se não tiver access_token inicial, renova imediatamente antes da 1ª chamada
    if (!accessToken) {
      accessToken = await this.refreshAccessToken();
    }

    const doFetch = async (token: string) => {
      return fetch(`${this.baseUrl}/items/${formattedId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "NOXBYTE-Platform/1.0",
        },
      });
    };

    let response = await doFetch(accessToken);

    if (response.status === 401 || response.status === 403) {
      console.warn(
        `[MercadoLivreAdapter] API respondeu ${response.status}; tentando uma renovação OAuth única.`,
      );
      try {
        accessToken = await this.refreshAccessToken();
        response = await doFetch(accessToken);
      } catch (refreshError) {
        const message =
          refreshError instanceof Error
            ? refreshError.message
            : "erro desconhecido";
        throw new MercadoLivreError(
          `Falha de autenticação no Mercado Livre: ${message}`,
          response.status,
        );
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new MercadoLivreError(
          `Produto '${formattedId}' não encontrado. Verifique se o ID informado é válido (ex: MLB123456789).`,
          404,
        );
      }
      if (response.status === 403) {
        throw new MercadoLivreError(
          "Acesso negado pelo PolicyAgent do Mercado Livre após renovar o token. Verifique aplicação, usuário autorizado e credenciais OAuth.",
          403,
        );
      }
      throw new MercadoLivreError(
        `Erro ao consultar API do Mercado Livre (status ${response.status}).`,
        response.status,
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
