import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { createApp } from "./src/app.js";
import productsRouter from "./routes/products.js"; // Adicionada extensão .js

export function createServer() {
  const app = express();

  app.use(cors());

  app.use(
    express.json({
      limit: "15mb",
    }),
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: "15mb",
    }),
  );

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Rota para operações de produtos (incluindo sincronização /api/products/:id/sync)
  app.use("/api/products", productsRouter);

  const modularApp = createApp();

  app.use(modularApp);

  return app;
}