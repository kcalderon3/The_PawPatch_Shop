import { useMemo, useState } from "react";
import { createCheckoutSession, uploadPetPhoto } from "../lib/api.js";

function createCartLine({ product, color, size, quantity, uploadedPhoto }) {
  return {
    lineId: `${product.id}-${color}-${size}-${uploadedPhoto?.name || "none"}-${Date.now()}`,
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity,
    color,
    size,
    image: product.images[0],
    petPhoto: uploadedPhoto,
  };
}

export function useCart() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  async function addCartItem({ product, color, size, quantity, petPhoto }) {
    if (!color || !size) {
      return { ok: false, error: "Choose a color and size first." };
    }

    if (product.customizable && !petPhoto) {
      return {
        ok: false,
        error: "Please upload a pet photo before adding this item.",
      };
    }

    try {
      const uploadedPhoto = petPhoto ? await uploadPetPhoto(petPhoto) : null;
      const item = createCartLine({
        product,
        color,
        size,
        quantity,
        uploadedPhoto,
      });

      setCart((current) => [...current, item]);
      setCartOpen(true);
      setCheckoutComplete(false);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message || "Photo upload failed. Please try again.",
      };
    }
  }

  function updateCartQuantity(lineId, nextQuantity) {
    if (nextQuantity < 1) {
      setCart((current) => current.filter((item) => item.lineId !== lineId));
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.lineId === lineId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  }

  async function checkout() {
    if (!cart.length) return;

    setCheckoutProcessing(true);
    setCheckoutError("");

    try {
      const payload = await createCheckoutSession(cart);

      if (payload.url) {
        window.location.assign(payload.url);
        return;
      }

      setCheckoutComplete(true);
    } catch (error) {
      setCheckoutError(
        error.message ||
          "Checkout is not configured yet. Add Stripe and Supabase environment variables to enable payment.",
      );
    } finally {
      setCheckoutProcessing(false);
    }
  }

  return {
    cart,
    cartCount,
    cartOpen,
    checkout,
    checkoutComplete,
    checkoutError,
    checkoutProcessing,
    addCartItem,
    setCartOpen,
    subtotal,
    updateCartQuantity,
  };
}
