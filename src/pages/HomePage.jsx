import React from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../utils/formatMoney.js";

export function HomePage({ featuredProducts, productLoadError }) {
  const homeProducts = featuredProducts.slice(0, 3);

  return (
    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Custom pet portrait embroidery</p>
          <h1>
            Your new favorite
            <span>sweater!</span>
          </h1>
          <Link className="primary-link" to="/shop">
            Shop Embroidered Pieces
          </Link>
        </div>
      </section>

      <section className="home-featured section-cream" aria-labelledby="home-featured-title">
        <div className="home-featured-heading">
          <p className="eyebrow dark">Featured Products</p>
          <h2 id="home-featured-title">Keep your pet close to your heart.</h2>
          {productLoadError && (
            <p className="backend-note">
              Showing local products while the backend catalog is unavailable.
            </p>
          )}
          <Link className="shop-all-link" to="/shop">
            Shop All
          </Link>
        </div>

        <div className="home-product-grid">
          {homeProducts.map((product) => (
            <article className="home-product-card" key={product.id}>
              <Link
                className="home-product-image"
                to={`/products/${product.id}`}
                aria-label={`Order ${product.name}`}
              >
                <img src={product.images[0]} alt={product.name} />
              </Link>
              <div className="home-product-copy">
                <Link to={`/products/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>
                <span>{formatMoney(product.price)}</span>
                <Link className="home-product-button" to={`/products/${product.id}`}>
                  Shop {product.category}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AboutSection />
    </main>
  );
}

function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-inner">
        <h2>Custom embroidered products stitched with love.</h2>

        <div className="about-photo about-photo-primary">
          <img
            src="/assets/about-kharisma-doberman.jpg"
            alt="Kharisma sitting outside with her Doberman"
          />
        </div>

        <div className="about-photo about-photo-secondary">
          <img
            src="/assets/about-kharisma-pup.jpg"
            alt="Kharisma holding her dog in a matching bandana"
          />
        </div>

        <div className="about-copy">
          <p>
            Hi! I'm Kharisma. I'm a dog lover living in San Francisco, CA. I
            have two pups of my own, a rescued Formosan Mountain Dog, and a
            Doberman Pinscher.
          </p>
          <p>
            Originally from Los Angeles, I'm a Latina with a degree in Software
            Engineering. I left my tech job in 2022 and focused on training my
            Doberman puppy. Now a days I spend my time living, breathing, and
            sleeping 'dogs'! I walk and train dogs and have decided to take the
            leap of faith to pursue my passion project - creating The Paw Patch.
          </p>
          <p>
            I strive to provide pet lovers all over the country with unique and
            quality embroidered products.
          </p>
          <p>
            I look forward to working with you to capture the beauty of your
            loved ones in embroidery form!
          </p>
        </div>
      </div>
    </section>
  );
}
