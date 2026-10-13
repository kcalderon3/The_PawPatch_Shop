import { fallbackProducts } from "../../src/data/storefront.js";
import { getSupabaseAdmin } from "./supabase.js";

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price ?? row.base_price ?? 0),
    category: row.category,
    images: row.images || [],
    description: row.description || "",
    colors: row.colors || [],
    sizes: row.sizes || [],
    customizable: Boolean(row.customizable),
  };
}

export async function getActiveProducts() {
  const supabase = getSupabaseAdmin();

  if (!supabase) return fallbackProducts;

  const { data, error } = await supabase
    .from("products")
    .select("id,name,base_price,category,images,description,customizable,product_options(colors,sizes)")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Could not load Supabase products", error);
    return fallbackProducts;
  }

  return data.map((product) =>
    normalizeProduct({
      ...product,
      price: product.base_price,
      colors: product.product_options?.[0]?.colors || [],
      sizes: product.product_options?.[0]?.sizes || [],
    }),
  );
}

export async function getProductMap() {
  const products = await getActiveProducts();
  return new Map(products.map((product) => [product.id, product]));
}

export async function validateCartItems(items = []) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("Cart is empty.");
  }

  const products = await getProductMap();

  return items.map((item) => {
    const product = products.get(item.productId);

    if (!product) {
      throw new Error(`Product ${item.productId} is no longer available.`);
    }

    if (!product.colors.includes(item.color)) {
      throw new Error(`${product.name} is not available in ${item.color}.`);
    }

    if (!product.sizes.includes(item.size)) {
      throw new Error(`${product.name} is not available in size ${item.size}.`);
    }

    if (product.customizable && !item.petPhoto?.storagePath) {
      throw new Error(`${product.name} requires an uploaded pet photo.`);
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`${product.name} has an invalid quantity.`);
    }

    return {
      product,
      quantity,
      color: item.color,
      size: item.size,
      petPhoto: item.petPhoto || null,
    };
  });
}
