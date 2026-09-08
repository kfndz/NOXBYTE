import { Request, Response } from "express";
import { ProductService } from "../services/ProductService.js";
import { priceSyncService } from "../services/PriceSyncService.js";

export const ProductController = {
  // ... métodos existentes (getAll, getById, create, update, remove) ...

  async sync(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;

      if (!id) {
        res.status(400).json({
          message: "ID do produto não informado.",
        });
        return;
      }

      const updatedProduct = await priceSyncService.syncProductById(id);

      res.status(200).json({
        message: "Produto sincronizado com sucesso.",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Erro na sincronização manual do produto:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao sincronizar produto.";

      res.status(400).json({
        message: errorMessage,
      });
    }
  },
};