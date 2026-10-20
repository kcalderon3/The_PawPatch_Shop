import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatMoney } from "../utils/formatMoney.js";

function getDefaultSize(product) {
  return product.sizes[Math.min(1, product.sizes.length - 1)];
}

export function ProductPage({ addCartItem, products }) {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [petPhoto, setPetPhoto] = useState(null);
  const [productError, setProductError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!product) return;

    setActiveImage(product.images[0]);
    setSelectedColor(product.colors[0]);
    setSelectedSize(getDefaultSize(product));
    setQuantity(1);
    setPetPhoto(null);
    setProductError("");
  }, [product]);

  if (!product) {
    return <ProductNotFound />;
  }

  const productImage =
    activeImage && product.images.includes(activeImage)
      ? activeImage
      : product.images[0];
  const currentColor = product.colors.includes(selectedColor)
    ? selectedColor
    : product.colors[0];
  const currentSize = product.sizes.includes(selectedSize)
    ? selectedSize
    : getDefaultSize(product);

  async function handleAddToCart() {
    setAddingToCart(true);
    setProductError("");

    const result = await addCartItem({
      product,
      color: currentColor,
      size: currentSize,
      quantity,
      petPhoto,
    });

    if (!result.ok) {
      setProductError(result.error);
    }

    setAddingToCart(false);
  }

  return (
    <main id="top" className="product-page">
      <section className="product-page-hero">
        <p className="eyebrow">Custom embroidered order</p>
        <h1>
          {product.name}
          <span>{formatMoney(product.price)}</span>
        </h1>
      </section>

      <section className="product-detail" id="product">
        <div className="detail-gallery">
          <div className="thumb-list" aria-label="Product images">
            {product.images.map((image) => (
              <button
                key={image}
                className={image === productImage ? "thumb active" : "thumb"}
                onClick={() => setActiveImage(image)}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
          <img className="detail-image" src={productImage} alt={product.name} />
        </div>

        <div className="detail-copy">
          <Link to="/shop" className="return-link">
            Return to shop
          </Link>
          <p className="eyebrow dark">{product.category}</p>
          <h2>{product.name}</h2>
          <p className="price">{formatMoney(product.price)}</p>
          <p className="description">{product.description}</p>

          <label>
            Color
            <select
              value={currentColor}
              onChange={(event) => setSelectedColor(event.target.value)}
            >
              {product.colors.map((color) => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </label>

          <label>
            Size
            <select
              value={currentSize}
              onChange={(event) => setSelectedSize(event.target.value)}
            >
              {product.sizes.map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>

          {product.customizable && (
            <label className="upload-box">
              Pet photo
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setPetPhoto(event.target.files?.[0] || null);
                  setProductError("");
                }}
              />
              <span>{petPhoto ? petPhoto.name : "Upload a clear face photo"}</span>
            </label>
          )}

          <div className="purchase-row">
            <div className="quantity-stepper" aria-label="Quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button
              className="primary-button"
              data-testid="add-to-cart"
              disabled={addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? "Uploading..." : "Add To Cart"}
            </button>
          </div>
          {productError && <p className="form-error">{productError}</p>}
        </div>
      </section>
    </main>
  );
}

function ProductNotFound() {
  return (
    <main id="top" className="product-page">
      <section className="section section-cream product-not-found">
        <p className="eyebrow dark">Product not found</p>
        <h1>
          This patch
          <span>wandered off.</span>
        </h1>
        <Link className="primary-link" to="/shop">
          Return to shop
        </Link>
      </section>
    </main>
  );
}
