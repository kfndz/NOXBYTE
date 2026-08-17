import productHandler from "./index.js";

export default async function handler(req: any, res: any) {
  return productHandler(req, res);
}
