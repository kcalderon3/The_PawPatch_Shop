import { describe, expect, it } from "vitest";
import { fallbackProducts } from "../src/data/storefront.js";
import { validateCartItems } from "../api/_lib/products.js";

const hoodie = fallbackProducts.find((product) => product.id === "embroidered-hoodie");
const giftCard = fallbackProducts.find((product) => product.id === "gift-card");

describe("validateCartItems", () => {
  it("normalizes valid items using the trusted catalog price", async () => {
    const [item] = await validateCartItems([
      {
        productId: hoodie.id,
        color: hoodie.colors[0],
        size: hoodie.sizes[2],
        quantity: 2,
        price: 1,
        petPhoto: { storagePath: "orders/photo.jpg" },
      },
    ]);

    expect(item.product.price).toBe(hoodie.price);
    expect(item.quantity).toBe(2);
    expect(item.color).toBe(hoodie.colors[0]);
    expect(item.size).toBe(hoodie.sizes[2]);
  });

  it("requires an uploaded photo for customizable products", async () => {
    await expect(
      validateCartItems([
        {
          productId: hoodie.id,
          color: hoodie.colors[0],
          size: hoodie.sizes[2],
          quantity: 1,
        },
      ]),
    ).rejects.toThrow("requires an uploaded pet photo");
  });

  it("allows non-customizable gift cards without a photo", async () => {
    const [item] = await validateCartItems([
      {
        productId: giftCard.id,
        color: giftCard.colors[0],
        size: giftCard.sizes[0],
        quantity: 1,
      },
    ]);

    expect(item.product.id).toBe(giftCard.id);
    expect(item.petPhoto).toBeNull();
  });

  it("rejects unknown products, colors, sizes, and invalid quantities", async () => {
    await expect(validateCartItems([{ productId: "missing-product" }])).rejects.toThrow(
      "is no longer available",
    );

    const baseItem = {
      productId: hoodie.id,
      color: hoodie.colors[0],
      size: hoodie.sizes[0],
      quantity: 1,
      petPhoto: { storagePath: "orders/photo.jpg" },
    };

    await expect(
      validateCartItems([{ ...baseItem, color: "Invisible" }]),
    ).rejects.toThrow("is not available in Invisible");

    await expect(
      validateCartItems([{ ...baseItem, size: "XXXL" }]),
    ).rejects.toThrow("is not available in size XXXL");

    await expect(
      validateCartItems([{ ...baseItem, quantity: 11 }]),
    ).rejects.toThrow("has an invalid quantity");
  });

  it("rejects an empty cart", async () => {
    await expect(validateCartItems([])).rejects.toThrow("Cart is empty");
  });
});
