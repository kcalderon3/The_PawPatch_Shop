import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer.jsx";
import { Footer } from "./components/Footer.jsx";
import { GalleryModal } from "./components/GalleryModal.jsx";
import { ScrollToHash } from "./components/ScrollToHash.jsx";
import { SiteHeader } from "./components/SiteHeader.jsx";
import { galleryImages } from "./data/storefront.js";
import { useCart } from "./hooks/useCart.js";
import { useProducts } from "./hooks/useProducts.js";
import { useSubscribe } from "./hooks/useSubscribe.js";
import { AdminPage } from "./pages/AdminPage.jsx";
import { CheckoutResult } from "./pages/CheckoutResult.jsx";
import { FaqPage } from "./pages/FaqPage.jsx";
import { GalleryPage } from "./pages/GalleryPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ProductPage } from "./pages/ProductPage.jsx";
import { ShopPage } from "./pages/ShopPage.jsx";

export default function App() {
  const { products, productLoadError } = useProducts();
  const cart = useCart();
  const subscription = useSubscribe();
  const [galleryIndex, setGalleryIndex] = useState(null);

  return (
    <div className="site-shell">
      <ScrollToHash />
      <SiteHeader
        cartCount={cart.cartCount}
        onCartOpen={() => cart.setCartOpen(true)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              featuredProducts={products}
              productLoadError={productLoadError}
            />
          }
        />
        <Route path="/shop" element={<ShopPage featuredProducts={products} />} />
        <Route
          path="/products/:productId"
          element={
            <ProductPage addCartItem={cart.addCartItem} products={products} />
          }
        />
        <Route
          path="/checkout/success"
          element={<CheckoutResult status="success" />}
        />
        <Route
          path="/checkout/cancel"
          element={<CheckoutResult status="cancel" />}
        />
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
        <Route path="/faqs" element={<FaqPage />} />
      </Routes>

      <Footer
        email={subscription.email}
        galleryImages={galleryImages}
        onEmailChange={subscription.setEmail}
        onSubmit={subscription.submitSubscription}
        subscribeError={subscription.subscribeError}
        subscribed={subscription.subscribed}
      />

      {cart.cartOpen && (
        <CartDrawer
          cart={cart.cart}
          checkoutComplete={cart.checkoutComplete}
          checkoutError={cart.checkoutError}
          checkoutProcessing={cart.checkoutProcessing}
          onCheckout={cart.checkout}
          onClose={() => cart.setCartOpen(false)}
          subtotal={cart.subtotal}
          updateCartQuantity={cart.updateCartQuantity}
        />
      )}

      {galleryIndex !== null && (
        <GalleryModal
          galleryImages={galleryImages}
          galleryIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
          onSelect={setGalleryIndex}
        />
      )}
    </div>
  );
}
