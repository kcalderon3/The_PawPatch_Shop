import React from "react";
import { Link } from "react-router-dom";

export function GalleryPage({ galleryImages, setGalleryIndex }) {
  return (
    <main id="top" className="gallery-page">
      <section className="gallery-section gallery-landing">
        <div className="gallery-hero">
          <p className="eyebrow">Finished stitches and happy pets</p>
          <h1>
            ThePawPatch
            <span>Gallery</span>
          </h1>
          <Link className="primary-link" to="/shop">
            Shop custom pieces
          </Link>
        </div>
        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <button
              className="gallery-tile"
              data-testid={`gallery-${index}`}
              key={image}
              onClick={() => setGalleryIndex(index)}
            >
              <img src={image} alt={`Custom embroidery gallery ${index + 1}`} />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
