import { Request, Response } from "express";
import { ProductService } from "../services/ProductService.js";
import { priceSyncService } from "../services/PriceSyncService.js";

export const ProductController = {
  // ... métodos existentes (getAll, getById, create, update, remove) ...

  async sync(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!id) {
        return res.status(400).json({
          message: "ID do produto não informado.",
        });
      }

      const updatedProduct = await priceSyncService.syncProductById(id);

      return res.status(200).json({
        message: "Produto sincronizado com sucesso.",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Erro na sincronização manual do produto:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao sincronizar produto.";

      return res.status(400).json({
        message: errorMessage,
      });
    }
  },
};