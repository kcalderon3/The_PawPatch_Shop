import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { fallbackProducts, faqs, galleryImages } from "./data/storefront.js";
import {
  browserSupabase,
  createCheckoutSession,
  fetchAdminOrders,
  fetchProducts,
  subscribeEmail,
  updateAdminOrder,
  uploadPetPhoto,
} from "./lib/api.js";

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

export default function App() {
  const [products, setProducts] = useState(fallbackProducts);
  const [productLoadError, setProductLoadError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(fallbackProducts[0]);
  const [activeImage, setActiveImage] = useState(fallbackProducts[0].images[0]);
  const [selectedColor, setSelectedColor] = useState(fallbackProducts[0].colors[0]);
  const [selectedSize, setSelectedSize] = useState(fallbackProducts[0].sizes[1]);
  const [quantity, setQuantity] = useState(1);
  const [petPhoto, setPetPhoto] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [productError, setProductError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribeError, setSubscribeError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const featuredProducts = useMemo(() => products, [products]);

  useEffect(() => {
    let ignore = false;

    fetchProducts()
      .then((nextProducts) => {
        if (ignore || !nextProducts?.length) return;
        setProducts(nextProducts);
        setSelectedProduct(nextProducts[0]);
        setActiveImage(nextProducts[0].images[0]);
        setSelectedColor(nextProducts[0].colors[0]);
        setSelectedSize(nextProducts[0].sizes[Math.min(1, nextProducts[0].sizes.length - 1)]);
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

  const resetOrderForProduct = useCallback((product) => {
    setSelectedProduct(product);
    setActiveImage(product.images[0]);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[Math.min(1, product.sizes.length - 1)]);
    setQuantity(1);
    setPetPhoto(null);
    setProductError("");
  }, []);

  async function addToCart(product = selectedProduct, color = selectedColor, size = selectedSize) {
    if (!color || !size) {
      setProductError("Choose a color and size first.");
      return;
    }

    if (product.customizable && !petPhoto) {
      setProductError("Please upload a pet photo before adding this item.");
      return;
    }

    setAddingToCart(true);
    setProductError("");

    let uploadedPhoto = null;

    try {
      uploadedPhoto = petPhoto ? await uploadPetPhoto(petPhoto) : null;
    } catch (error) {
      setProductError(error.message || "Photo upload failed. Please try again.");
      setAddingToCart(false);
      return;
    }

    const item = {
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

    setCart((current) => [...current, item]);
    setCartOpen(true);
    setCheckoutComplete(false);
    setProductError("");
    setAddingToCart(false);
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

  async function handleCheckout() {
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

  async function handleSubscribe(event) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribeError("");

    try {
      await subscribeEmail(email.trim());
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      setSubscribeError(error.message || "Could not subscribe right now.");
    }
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
              featuredProducts={featuredProducts}
              productLoadError={productLoadError}
            />
          }
        />
        <Route
          path="/shop"
          element={<ShopPage featuredProducts={featuredProducts} />}
        />
        <Route
          path="/products/:productId"
          element={
            <ProductPage
              activeImage={activeImage}
              addToCart={addToCart}
              addingToCart={addingToCart}
              petPhoto={petPhoto}
              productError={productError}
              products={products}
              quantity={quantity}
              resetOrderForProduct={resetOrderForProduct}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              setActiveImage={setActiveImage}
              setPetPhoto={setPetPhoto}
              setProductError={setProductError}
              setQuantity={setQuantity}
              setSelectedColor={setSelectedColor}
              setSelectedSize={setSelectedSize}
            />
          }
        />
        <Route path="/checkout/success" element={<CheckoutResult status="success" />} />
        <Route path="/checkout/cancel" element={<CheckoutResult status="cancel" />} />
        <Route path="/admin" element={<AdminPage />} />
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
          <img
            className="footer-logo"
            src="/assets/footer-paw-patch-logo.png"
            alt="The Paw Patch pet embroidery logo"
          />
          <form onSubmit={handleSubscribe}>
            <h2 className="footer-subscribe-title">Subscribe</h2>
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
            {subscribeError && <span className="form-error">{subscribeError}</span>}
          </form>
          <div className="socials" aria-label="Social links">
            <a
              href="https://www.instagram.com/the.paw.patch/"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.4" cy="6.6" r="1.1" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100084136454834"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.2 8.1h2.6V4.3c-.5-.1-2-.3-3.7-.3-3.6 0-6 2.2-6 6.2v3.5H3v4.2h4.1V24h4.9v-6.1h4.1l.7-4.2H12v-3c0-1.2.4-2.6 2.2-2.6Z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@the.paw.patch"
              aria-label="TikTok"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.4 2c.4 3.2 2.2 5.1 5.2 5.3v4.2a8.9 8.9 0 0 1-5.1-1.6v6.9c0 4.4-3.5 7.2-7.5 5.8-6.4-2.2-4.3-11.7 2.1-12.1.6 0 1.1 0 1.7.1v4.3c-.6-.2-1.1-.3-1.7-.2-3.1.2-3.4 4.8-.5 5.3 1.9.3 3.4-1 3.4-3.5V2h2.4Z" />
              </svg>
            </a>
            <a href="mailto:the.paw.patch.shop@gmail.com" aria-label="Email">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="1.8" />
                <path d="m4.5 7 7.5 6 7.5-6" />
              </svg>
            </a>
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
                disabled={checkoutProcessing || !cart.length}
                onClick={handleCheckout}
              >
                {checkoutProcessing ? "Opening Checkout..." : "Checkout"}
              </button>
              <p>Secure checkout is powered by Stripe when backend keys are configured.</p>
              {checkoutError && <p className="form-error">{checkoutError}</p>}
              {checkoutComplete && (
                <p className="success">
                  Checkout preview created. Add Stripe and Supabase environment variables to accept payment.
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
          <NavLink to="/shop">Shop</NavLink>
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

function HomePage({ featuredProducts, productLoadError }) {
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
              Originally from Los Angeles, I'm a Latina with a degree in
              Software Engineering. I left my tech job in 2022 and focused on
              training my Doberman puppy. Now a days I spend my time living,
              breathing, and sleeping 'dogs'! I walk and train dogs and have
              decided to take the leap of faith to pursue my passion project -
              creating The Paw Patch.
            </p>
            <p>
              I strive to provide pet lovers all over the country with unique
              and quality embroidered products.
            </p>
            <p>
              I look forward to working with you to capture the beauty of your
              loved ones in embroidery form!
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function ShopPage({ featuredProducts }) {
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

function ProductPage({
  activeImage,
  addToCart,
  addingToCart,
  petPhoto,
  productError,
  products,
  quantity,
  resetOrderForProduct,
  selectedColor,
  selectedSize,
  setActiveImage,
  setPetPhoto,
  setProductError,
  setQuantity,
  setSelectedColor,
  setSelectedSize,
}) {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);

  useEffect(() => {
    if (product) {
      resetOrderForProduct(product);
    }
  }, [product, resetOrderForProduct]);

  if (!product) {
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

  const productImage =
    activeImage && product.images.includes(activeImage)
      ? activeImage
      : product.images[0];
  const currentColor = product.colors.includes(selectedColor)
    ? selectedColor
    : product.colors[0];
  const currentSize = product.sizes.includes(selectedSize)
    ? selectedSize
    : product.sizes[Math.min(1, product.sizes.length - 1)];

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
          <img
            className="detail-image"
            src={productImage}
            alt={product.name}
          />
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
              onClick={() => addToCart(product, currentColor, currentSize)}
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

function FaqPage({ faqs, openFaq, setOpenFaq }) {
  return (
    <main id="top" className="faq-page">
      <section className="faq-page-hero">
        <p className="eyebrow">Ordering details</p>
        <h1>
          FAQs
          <span>before you buy.</span>
        </h1>
        <Link className="primary-link" to="/shop">
          Start your order
        </Link>
      </section>

      <section className="faq-section faq-landing">
        <div className="faq-images" aria-hidden="true">
          <img src="/assets/faq-embroidered-frenchies.jpg" alt="" />
          <img src="/assets/faq-customer-cat.jpg" alt="" />
          <img src="/assets/faq-embroidered-spaniel.jpg" alt="" />
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

function CheckoutResult({ status }) {
  const isSuccess = status === "success";

  return (
    <main id="top" className="checkout-result">
      <section className="section section-cream product-not-found">
        <p className="eyebrow dark">{isSuccess ? "Order received" : "Checkout paused"}</p>
        <h1>
          {isSuccess ? "Thank you!" : "No worries."}
          <span>{isSuccess ? "We got your order." : "Your cart is safe."}</span>
        </h1>
        <p className="description">
          {isSuccess
            ? "Stripe will send your receipt. We will review your uploaded pet photo and follow up before stitching."
            : "You can return to the shop whenever you are ready to finish your custom order."}
        </p>
        <Link className="primary-link" to="/shop">
          Back to shop
        </Link>
      </section>
    </main>
  );
}

function AdminPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!browserSupabase) return;

    browserSupabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = browserSupabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadOrders = useCallback(async () => {
    if (!session?.access_token) return;

    setLoadingOrders(true);
    setAdminError("");

    try {
      const payload = await fetchAdminOrders(session.access_token);
      setOrders(payload.orders || []);
    } catch (error) {
      setAdminError(error.message || "Could not load orders.");
    } finally {
      setLoadingOrders(false);
    }
  }, [session]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function requestMagicLink(event) {
    event.preventDefault();
    setAdminMessage("");
    setAdminError("");

    if (!browserSupabase) {
      setAdminError("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable admin login.");
      return;
    }

    const { error } = await browserSupabase.auth.signInWithOtp({
      email: adminEmail,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });

    if (error) {
      setAdminError(error.message);
      return;
    }

    setAdminMessage("Check your email for the admin sign-in link.");
  }

  async function updateOrder(orderId, changes) {
    if (!session?.access_token) return;

    setAdminError("");

    try {
      await updateAdminOrder(session.access_token, orderId, changes);
      await loadOrders();
    } catch (error) {
      setAdminError(error.message || "Could not update order.");
    }
  }

  return (
    <main id="top" className="admin-page">
      <section className="admin-hero">
        <p className="eyebrow">Private dashboard</p>
        <h1>
          Order
          <span>Admin</span>
        </h1>
      </section>

      <section className="admin-panel">
        {!session ? (
          <form className="admin-login" onSubmit={requestMagicLink}>
            <h2>Sign in with your admin email.</h2>
            <label>
              Email
              <input
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <button className="primary-button">Send magic link</button>
            {adminMessage && <p className="success">{adminMessage}</p>}
            {adminError && <p className="form-error">{adminError}</p>}
          </form>
        ) : (
          <>
            <div className="admin-toolbar">
              <div>
                <p className="eyebrow dark">Signed in</p>
                <h2>{session.user.email}</h2>
              </div>
              <div className="admin-actions">
                <button className="secondary-button" onClick={loadOrders}>
                  {loadingOrders ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  className="secondary-button"
                  onClick={() => browserSupabase.auth.signOut()}
                >
                  Sign out
                </button>
              </div>
            </div>
            {adminError && <p className="form-error">{adminError}</p>}
            {!orders.length ? (
              <p className="empty-cart">
                {loadingOrders ? "Loading orders..." : "No live orders yet."}
              </p>
            ) : (
              <div className="admin-orders">
                {orders.map((order) => (
                  <article className="admin-order" key={order.id}>
                    <div>
                      <p className="eyebrow dark">{order.status}</p>
                      <h3>{order.customer_email || "Guest customer"}</h3>
                      <p>{formatMoney((order.total_cents || 0) / 100)}</p>
                      {order.shipping_state && (
                        <p>
                          Ship to {order.shipping_state}
                          {["AK", "HI", "PR", "GU", "VI", "AS", "MP"].includes(
                            order.shipping_state,
                          ) && " - review non-continental destination"}
                        </p>
                      )}
                    </div>
                    <label>
                      Fulfillment status
                      <select
                        value={order.fulfillment_status || "needs_review"}
                        onChange={(event) =>
                          updateOrder(order.id, {
                            fulfillment_status: event.target.value,
                          })
                        }
                      >
                        <option value="needs_review">Needs review</option>
                        <option value="design_sent">Design sent</option>
                        <option value="approved">Approved</option>
                        <option value="in_production">In production</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </label>
                    <label>
                      Admin notes
                      <textarea
                        defaultValue={order.admin_notes || ""}
                        onBlur={(event) =>
                          updateOrder(order.id, { admin_notes: event.target.value })
                        }
                      />
                    </label>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
