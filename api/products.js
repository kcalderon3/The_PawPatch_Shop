import { json, methodNotAllowed } from "./_lib/http.js";
import { getActiveProducts } from "./_lib/products.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    const response = methodNotAllowed();
    res.status(response.statusCode).setHeader("Content-Type", "application/json").end(response.body);
    return;
  }

  const products = await getActiveProducts();
  const response = json({ products });
  res.status(response.statusCode).setHeader("Content-Type", "application/json").end(response.body);
}
