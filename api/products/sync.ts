import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SyncService } from "../../server/src/services/sync/SyncService.js";
import {
  MercadoLivreAdapter,
  MercadoLivreError,
} from "../../server/src/adapters/MercadoLivreAdapter.js";

const syncService = new SyncService([
  new MercadoLivreAdapter(),
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const productId = (req.query.id as string) || req.body?.id;

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "ID do produto é obrigatório." });
    }

    const updatedProduct = await syncService.syncSingleProduct(productId);

    return res.status(200).json({
      success: true,
      message: "Produto sincronizado com sucesso!",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("[API Sync Error]:", error);
    const status =
      error instanceof MercadoLivreError && error.status && error.status >= 400
        ? error.status
        : 400;

    return res.status(status).json({
      success: false,
      error: error.message || "Erro interno ao sincronizar produto.",
      message: error.message || "Erro interno ao sincronizar produto.",
    });
  }
}