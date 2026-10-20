import React from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../utils/formatMoney.js";

export function ShopPage({ featuredProducts }) {
  return (
    <main id="top" className="shop-page">
      <section className="section section-cream" id="shop">
        <div className="section-heading">
          <p className="eyebrow dark">Featured Products</p>
          <h2>Made for people who talk about their pets a lot.</h2>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <Link
                className="product-image-button"
                data-testid={`product-${product.id}`}
                aria-label={`View ${product.name}`}
                to={`/products/${product.id}`}
              >
                <img src={product.images[0]} alt={product.name} />
              </Link>
              <div className="product-card-copy">
                <p>{product.category}</p>
                <h3>{product.name}</h3>
                <span>{formatMoney(product.price)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
