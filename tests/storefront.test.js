import { describe, expect, it } from "vitest";
import { fallbackProducts, faqs, galleryImages } from "../src/data/storefront.js";
import { formatMoney } from "../src/utils/formatMoney.js";

describe("storefront data", () => {
  it("contains the products used by the home page and shop", () => {
    expect(fallbackProducts).toHaveLength(6);
    expect(fallbackProducts.slice(0, 3).map((product) => product.id)).toEqual([
      "embroidered-hoodie",
      "embroidered-crewneck",
      "embroidered-sweatsuit",
    ]);
  });

  it("keeps every product usable for an order page", () => {
    for (const product of fallbackProducts) {
      expect(product.id).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.price).toBeGreaterThanOrEqual(0);
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.colors.length).toBeGreaterThan(0);
      expect(product.sizes.length).toBeGreaterThan(0);
    }
  });

  it("contains gallery and FAQ content", () => {
    expect(galleryImages.length).toBeGreaterThanOrEqual(6);
    expect(faqs.length).toBeGreaterThanOrEqual(10);
    expect(faqs.every((faq) => faq.question && faq.answer)).toBe(true);
  });
});

describe("formatMoney", () => {
  it("formats prices with two decimal places", () => {
    expect(formatMoney(110)).toBe("$110.00");
    expect(formatMoney(25.5)).toBe("$25.50");
  });
});
