import { useEffect, useState } from "react";
import { fallbackProducts } from "../data/storefront.js";
import { fetchProducts } from "../lib/api.js";

export function useProducts() {
  const [products, setProducts] = useState(fallbackProducts);
  const [productLoadError, setProductLoadError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchProducts()
      .then((nextProducts) => {
        if (ignore || !nextProducts?.length) return;
        setProducts(nextProducts);
      })
      .catch((error) => {
        if (!ignore) {
          setProductLoadError(error.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { products, productLoadError };
}
