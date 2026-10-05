import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

const products = [
  {
    id: "embroidered-hoodie",
    name: "Embroidered Hoodie",
    price: 110,
    category: "Hoodies",
    images: ["/assets/hoodie-pink.png", "/assets/gallery-1.png"],
    description:
      "A soft fleece hoodie stitched with a custom portrait of your favorite pet.",
    colors: ["Blush", "Cream", "Sage", "Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    customizable: true,
  },
  {
    id: "embroidered-crewneck",
    name: "Embroidered Crewneck",
    price: 100,
    category: "Crewnecks",
    images: ["/assets/crewneck-blue.png", "/assets/gallery-2.png"],
    description:
      "A classic crewneck with portrait embroidery placed over the heart.",
    colors: ["Sky", "Sand", "Ivory", "Olive"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    customizable: true,
  },
  {
    id: "embroidered-sweatsuit",
    name: "Embroidered Sweatsuit Set",
    price: 145,
    category: "Sets",
    images: ["/assets/sweatsuit-cream.png", "/assets/gallery-3.png"],
    description:
      "A matching hoodie and jogger set with a sweet custom pet portrait detail.",
    colors: ["Buttercream", "Heather", "Rose", "Forest"],
    sizes: ["XS", "S", "M", "L", "XL"],
    customizable: true,
  },
  {
    id: "tan-crewneck",
    name: "Custom Portrait Crew",
    price: 98,
    category: "Crewnecks",
    images: ["/assets/crewneck-tan.png", "/assets/gallery-4.png"],
    description:
      "Warm neutral fleece finished with a detailed thread portrait.",
    colors: ["Oat", "Mocha", "Pine", "White"],
    sizes: ["S", "M", "L", "XL"],
    customizable: true,
  },
  {
    id: "mint-hoodie",
    name: "Pet Patch Hoodie",
    price: 115,
    category: "Hoodies",
    images: ["/assets/hoodie-mint.png", "/assets/gallery-5.png"],
    description:
      "A relaxed hoodie designed for everyday wear and tiny embroidered tributes.",
    colors: ["Mint", "Petal", "Cream", "Black"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    customizable: true,
  },
  {
    id: "gift-card",
    name: "Custom Embroidery Gift Card",
    price: 50,
    category: "Gifts",
    images: ["/assets/gift-card.png"],
    description:
      "Give them a head start on their own custom pet portrait piece.",
    colors: ["Digital"],
    sizes: ["$50", "$100", "$150"],
    customizable: false,
  },
];

const galleryImages = [
  "/assets/gallery-1.png",
  "/assets/gallery-2.png",
  "/assets/gallery-3.png",
  "/assets/gallery-4.png",
  "/assets/gallery-5.png",
  "/assets/patch-founder.png",
];

const faqs = [
  {
    question: "What is the sizing for sweaters and hoodies?",
    answer:
      "Sizing is unisex and relaxed. Choose your usual size for a cozy fit or size up for an oversized look.",
  },
  {
    question: "What brand sweaters are used?",
    answer:
      "This mock storefront uses premium fleece blanks as the standard. Exact brands can be added once production details are finalized.",
  },
  {
    question: "What kind of image should I provide?",
    answer:
      "Upload a clear, well-lit photo where your pet's face is visible. Front-facing photos with minimal blur work best.",
  },
  {
    question: "Will I see the digitized image before embroidery?",
    answer:
      "Yes. The final store can include an approval step before stitching. For this mock build, the upload is captured with the cart item.",
  },
  {
    question: "Where do you ship?",
    answer:
      "The original reference mentioned continental U.S. shipping. Shipping rules can be connected to a live checkout later.",
  },
];

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [activeImage, setActiveImage] = useState(products[0].images[0]);
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0]);
  const [selectedSize, setSelectedSize] = useState(products[0].sizes[1]);
  const [quantity, setQuantity] = useState(1);
  const [petPhoto, setPetPhoto] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [productError, setProductError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const productImage = activeImage || selectedProduct.images[0];

  const featuredProducts = useMemo(() => products, []);

  function chooseProduct(product) {
    setSelectedProduct(product);
    setActiveImage(product.images[0]);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[Math.min(1, product.sizes.length - 1)]);
    setQuantity(1);
    setPetPhoto(null);
    setProductError("");
    document.getElementById("product")?.scrollIntoView({ behavior: "smooth" });
  }

  function addToCart() {
    if (!selectedColor || !selectedSize) {
      setProductError("Choose a color and size first.");
      return;
    }

    if (selectedProduct.customizable && !petPhoto) {
      setProductError("Please upload a pet photo before adding this item.");
      return;
    }

    const item = {
      lineId: `${selectedProduct.id}-${selectedColor}-${selectedSize}-${petPhoto?.name || "none"}-${Date.now()}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity,
      color: selectedColor,
      size: selectedSize,
      image: selectedProduct.images[0],
      petPhoto: petPhoto
        ? { name: petPhoto.name, size: petPhoto.size, type: petPhoto.type }
        : null,
    };

    setCart((current) => [...current, item]);
    setCartOpen(true);
    setCheckoutComplete(false);
    setProductError("");
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

  function handleCheckout() {
    if (!cart.length) return;
    setCheckoutComplete(true);
  }

  function handleSubscribe(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <div className="site-shell">
      <ScrollToHash />
      <SiteHeader cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              activeImage={activeImage}
              addToCart={addToCart}
              featuredProducts={featuredProducts}
              petPhoto={petPhoto}
              productError={productError}
              productImage={productImage}
              quantity={quantity}
              selectedColor={selectedColor}
              selectedProduct={selectedProduct}
              selectedSize={selectedSize}
              setActiveImage={setActiveImage}
              setPetPhoto={setPetPhoto}
              setProductError={setProductError}
              setQuantity={setQuantity}
              setSelectedColor={setSelectedColor}
              setSelectedSize={setSelectedSize}
              chooseProduct={chooseProduct}
            />
          }
        />
        <Route
          path="/gallery"
          element={
            <GalleryPage
              galleryImages={galleryImages}
              setGalleryIndex={setGalleryIndex}
            />
          }
        />
        <Route
          path="/faqs"
          element={
            <FaqPage
              faqs={faqs}
              openFaq={openFaq}
              setOpenFaq={setOpenFaq}
            />
          }
        />
      </Routes>

      <footer className="footer">
        <div className="footer-strip">
          {galleryImages.slice(0, 5).map((image) => (
            <img src={image} alt="" key={image} />
          ))}
        </div>
        <div className="footer-main">
          <img src="/assets/patch-founder.png" alt="" />
          <form onSubmit={handleSubscribe}>
            <h2>Subscribe</h2>
            <p>Be the first to hear about sales and new product releases.</p>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Email address"
            />
            <button className="secondary-button">Sign Up</button>
            {subscribed && <span className="success">You are on the list.</span>}
          </form>
          <div className="socials" aria-label="Social links">
            <a href="#top">IG</a>
            <a href="#top">FB</a>
            <a href="#top">TT</a>
            <a href="#top">Mail</a>
          </div>
        </div>
      </footer>

      {cartOpen && (
        <aside className="cart-drawer" aria-label="Shopping cart" data-testid="cart-drawer">
          <div className="cart-panel">
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart">
                Close
              </button>
            </div>

            {!cart.length ? (
              <p className="empty-cart">Your cart is waiting for its first patch.</p>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <article className="cart-item" key={item.lineId}>
                    <img src={item.image} alt="" />
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.color} / {item.size}
                      </p>
                      {item.petPhoto && <p>Photo: {item.petPhoto.name}</p>}
                      <div className="cart-item-actions">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.lineId, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.lineId, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <strong>{formatMoney(item.price * item.quantity)}</strong>
                  </article>
                ))}
              </div>
            )}

            <div className="cart-footer">
              <div>
                <span>Subtotal</span>
                <strong>{formatMoney(subtotal)}</strong>
              </div>
              <button
                className="primary-button"
                data-testid="checkout"
                onClick={handleCheckout}
              >
                Checkout
              </button>
              <p>Mock checkout only. No payment will be processed.</p>
              {checkoutComplete && (
                <p className="success">
                  Order preview created. Live payment can be connected later.
                </p>
              )}
            </div>
          </div>
        </aside>
      )}

      {galleryIndex !== null && (
        <div className="modal" role="dialog" aria-modal="true">
          <button
            className="modal-close"
            onClick={() => setGalleryIndex(null)}
            aria-label="Close gallery image"
          >
            Close
          </button>
          <button
            className="modal-arrow left"
            onClick={() =>
              setGalleryIndex(
                (galleryIndex - 1 + galleryImages.length) % galleryImages.length,
              )
            }
            aria-label="Previous gallery image"
          >
            Prev
          </button>
          <img
            src={galleryImages[galleryIndex]}
            alt={`Gallery embroidery ${galleryIndex + 1}`}
          />
          <button
            className="modal-arrow right"
            onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}
            aria-label="Next gallery image"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (hash) {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [hash, pathname]);

  return null;
}

function SiteHeader({ cartCount, onCartOpen }) {
  return (
    <header className="topbar">
      <p className="shipping-note">FREE shipping on all orders | Continental US</p>
      <div className="nav-row">
        <Link className="brand" to="/" aria-label="The Paw Patch home">
          The Paw Patch
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/#shop">Shop</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/faqs">FAQs</NavLink>
        </nav>
        <button className="cart-button" onClick={onCartOpen}>
          <span aria-hidden="true">Bag</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

function HomePage({
  activeImage,
  addToCart,
  chooseProduct,
  featuredProducts,
  petPhoto,
  productError,
  productImage,
  quantity,
  selectedColor,
  selectedProduct,
  selectedSize,
  setActiveImage,
  setPetPhoto,
  setProductError,
  setQuantity,
  setSelectedColor,
  setSelectedSize,
}) {
  return (
    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Custom pet portrait embroidery</p>
          <h1>
            Your new favorite
            <span>sweater!</span>
          </h1>
          <a className="primary-link" href="#shop">
            Shop embroidered pieces
          </a>
        </div>
      </section>

      <section className="section section-cream" id="shop">
        <div className="section-heading">
          <p className="eyebrow dark">Featured Products</p>
          <h2>Made for people who talk about their pets a lot.</h2>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <button
                className="product-image-button"
                data-testid={`product-${product.id}`}
                onClick={() => chooseProduct(product)}
                aria-label={`View ${product.name}`}
              >
                <img src={product.images[0]} alt={product.name} />
              </button>
              <div className="product-card-copy">
                <p>{product.category}</p>
                <h3>{product.name}</h3>
                <span>{formatMoney(product.price)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="product-detail" id="product">
        <div className="detail-gallery">
          <div className="thumb-list" aria-label="Product images">
            {selectedProduct.images.map((image) => (
              <button
                key={image}
                className={image === productImage ? "thumb active" : "thumb"}
                onClick={() => setActiveImage(image)}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
          <img
            className="detail-image"
            src={productImage}
            alt={selectedProduct.name}
          />
        </div>

        <div className="detail-copy">
          <a href="#shop" className="return-link">
            Return to shop
          </a>
          <p className="eyebrow dark">{selectedProduct.category}</p>
          <h2>{selectedProduct.name}</h2>
          <p className="price">{formatMoney(selectedProduct.price)}</p>
          <p className="description">{selectedProduct.description}</p>

          <label>
            Color
            <select
              value={selectedColor}
              onChange={(event) => setSelectedColor(event.target.value)}
            >
              {selectedProduct.colors.map((color) => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </label>

          <label>
            Size
            <select
              value={selectedSize}
              onChange={(event) => setSelectedSize(event.target.value)}
            >
              {selectedProduct.sizes.map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>

          {selectedProduct.customizable && (
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
              onClick={addToCart}
            >
              Add To Cart
            </button>
          </div>
          {productError && <p className="form-error">{productError}</p>}
        </div>
      </section>

    </main>
  );
}

function GalleryPage({ galleryImages, setGalleryIndex }) {
  return (
    <main id="top" className="gallery-page">
      <section className="gallery-section gallery-landing">
        <div className="gallery-hero">
          <p className="eyebrow">Finished stitches and happy pets</p>
          <h1>
            ThePawPatch
            <span>Gallery</span>
          </h1>
          <Link className="primary-link" to="/#shop">
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

function FaqPage({ faqs, openFaq, setOpenFaq }) {
  return (
    <main id="top" className="faq-page">
      <section className="faq-page-hero">
        <p className="eyebrow">Ordering details</p>
        <h1>
          FAQs
          <span>before you buy.</span>
        </h1>
        <Link className="primary-link" to="/#shop">
          Start your order
        </Link>
      </section>

      <section className="faq-section faq-landing">
        <div className="faq-images" aria-hidden="true">
          <img src="/assets/gallery-3.png" alt="" />
          <img src="/assets/patch-founder.png" alt="" />
          <img src="/assets/gallery-1.png" alt="" />
        </div>
        <div className="faq-copy">
          <p className="eyebrow dark">Details</p>
          <h2>What to know before ordering.</h2>
          <div className="accordion">
            {faqs.map((faq, index) => (
              <div className="faq-item" key={faq.question}>
                <button
                  data-testid={`faq-${index}`}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                >
                  {faq.question}
                  <span>{openFaq === index ? "-" : "+"}</span>
                </button>
                {openFaq === index && <p>{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
