import { MarketplaceAdapter, SyncResult } from "./MarketplaceAdapter.js";

export class MercadoLivreError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "MercadoLivreError";
  }
}

export class MercadoLivreAdapter implements MarketplaceAdapter {
  readonly marketplaceName = "MERCADO_LIVRE";

  private accessToken: string | null = null;
  private accessTokenExpiresAt = 0;

  private readonly userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
  ];

  private extractItemId(value: string): string | null {
    const match = value.match(/(?:^|[^A-Z])(MLB)[-]?([0-9]{6,})(?:[^0-9]|$)/i);
    return match ? `MLB${match[2]}`.toUpperCase() : null;
  }

  private normalizePrice(value: unknown): number | null {
    if (typeof value === "number") {
      return Number.isFinite(value) && value >= 0 ? value : null;
    }

    if (typeof value !== "string") return null;

    const cleaned = value.replace(/[^0-9,.-]/g, "").trim();
    if (!cleaned) return null;

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    let normalized = cleaned;

    if (lastComma >= 0 && lastDot >= 0) {
      const decimalSeparator = lastComma > lastDot ? "," : ".";
      const thousandsSeparator = decimalSeparator === "," ? "." : ",";
      normalized = cleaned
        .replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
        .replace(decimalSeparator, ".");
    } else if (lastComma >= 0) {
      normalized = /,\d{1,2}$/.test(cleaned)
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
    } else if ((cleaned.match(/\./g) || []).length > 1) {
      normalized = cleaned.replace(/\./g, "");
    } else if (/^\d+\.\d{3}$/.test(cleaned)) {
      normalized = cleaned.replace(".", "");
    }

    const price = Number(normalized);
    return Number.isFinite(price) && price >= 0 ? price : null;
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit = {},
  ): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.userAgents.length; attempt += 1) {
      try {
        const response = await fetch(url, {
          ...init,
          headers: {
            Accept: "application/json",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
            ...init.headers,
            "User-Agent": this.userAgents[attempt],
          },
          redirect: "follow",
          signal: AbortSignal.timeout(10_000),
        });

        if (response.ok || (response.status !== 403 && response.status !== 429) || attempt === this.userAgents.length - 1) {
          return response;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) throw lastError;
    throw new MercadoLivreError(`Mercado Livre bloqueou a requisição para ${url}`);
  }

  private async getValidAccessToken(): Promise<string | null> {
    const now = Date.now();
    if (this.accessToken && now < this.accessTokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const configuredToken = process.env.MERCADO_LIVRE_ACCESS_TOKEN?.trim();
    const refreshToken = process.env.MERCADO_LIVRE_REFRESH_TOKEN?.trim();
    const clientId = process.env.MERCADO_LIVRE_CLIENT_ID?.trim();
    const clientSecret = process.env.MERCADO_LIVRE_CLIENT_SECRET?.trim();

    if (!refreshToken || !clientId || !clientSecret) {
      return configuredToken || null;
    }

    try {
      const response = await fetch("https://api.mercadolibre.com/oauth/token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this.userAgents[0],
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = null;
      }

      if (!response.ok || !data?.access_token) {
        console.error("[MercadoLivreAdapter] Falha ao renovar token:", {
          status: response.status,
          error: data?.error,
          message: data?.message,
        });
        return configuredToken || null;
      }

      this.accessToken = data.access_token;
      this.accessTokenExpiresAt = now + Number(data.expires_in ?? 21_600) * 1000;

      if (data.refresh_token) {
        process.env.MERCADO_LIVRE_REFRESH_TOKEN = data.refresh_token;
      }

      return this.accessToken;
    } catch (error) {
      console.error("[MercadoLivreAdapter] Erro ao renovar token:", error);
      return configuredToken || null;
    }
  }

  private async apiHeaders(accessToken?: string | null): Promise<HeadersInit> {
    return {
      Accept: "application/json",
      "User-Agent": this.userAgents[0],
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  }

  private async readApiResponse(response: Response): Promise<any | null> {
    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch {
      return null;
    }
  }

  private getSyncResult(item: any): SyncResult | null {
    const price = this.normalizePrice(item?.price);
    if (price === null) return null;

    return {
      price,
      originalPrice: this.normalizePrice(item.original_price),
      availability: item.status === "active" ? "AVAILABLE" : "UNAVAILABLE",
      syncStatus: "synced",
      rawResponse: item,
    };
  }

  private skippedThirdParty(itemId: string, status: number): SyncResult {
    return {
      price: 0,
      originalPrice: null,
      availability: "UNKNOWN",
      syncStatus: "skipped_third_party",
      skipReason: `Mercado Livre recusou o acesso ao anúncio ${itemId}.`,
      rawResponse: { status, itemId },
    };
  }

  async fetchProductData(externalProductId: string): Promise<SyncResult> {
    // affiliateUrl/meli.la pertence ao frontend e nunca deve ser buscado pelo backend.
    const itemId = this.extractItemId(externalProductId);

    if (!itemId) {
      throw new MercadoLivreError(
        "Não foi possível identificar o anúncio do Mercado Livre a partir do link ou externalProductId.",
      );
    }

    let lastStatus: number | undefined;
    const accessToken = await this.getValidAccessToken();
    const headers = await this.apiHeaders(accessToken);

    // O access token renovado é usado primeiro; a consulta anônima fica como fallback.
    try {
      const itemResponse = await this.fetchWithRetry(
        `https://api.mercadolibre.com/items/${itemId}`,
        { headers },
      );
      lastStatus = itemResponse.status;

      if (itemResponse.ok) {
        const result = this.getSyncResult(await this.readApiResponse(itemResponse));
        if (result) return result;
      } else {
        const errorBody = await this.readApiResponse(itemResponse);
        console.error("[MercadoLivreAdapter] Erro no endpoint de item:", {
          status: itemResponse.status,
          error: errorBody?.error,
          code: errorBody?.code,
          message: errorBody?.message,
        });
      }
      if (itemResponse.status === 401 || itemResponse.status === 403) {
        return this.skippedThirdParty(itemId, itemResponse.status);
      }
    } catch (error) {
      console.error(`[MercadoLivreAdapter] Falha no endpoint direto:`, error);
    }

    try {
      const searchResponse = await this.fetchWithRetry(
        `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(itemId)}`,
        { headers },
      );
      lastStatus = searchResponse.status;

      if (searchResponse.ok) {
        const searchData = await this.readApiResponse(searchResponse);
        const item = searchData?.results?.find(
          (candidate: any) => String(candidate?.id).toUpperCase() === itemId,
        );
        const result = this.getSyncResult(item);
        if (result) return result;
      } else {
        const errorBody = await this.readApiResponse(searchResponse);
        console.error("[MercadoLivreAdapter] Erro no endpoint de busca:", {
          status: searchResponse.status,
          error: errorBody?.error,
          code: errorBody?.code,
          message: errorBody?.message,
        });
      }
      if (searchResponse.status === 401 || searchResponse.status === 403) {
        return this.skippedThirdParty(itemId, searchResponse.status);
      }
    } catch (err) {
      console.error(`[MercadoLivreAdapter] Falha no endpoint de busca:`, err);
    }

    throw new MercadoLivreError(
      `Não foi possível obter o preço do anúncio ${itemId} no Mercado Livre.`,
      lastStatus,
    );
  }
}