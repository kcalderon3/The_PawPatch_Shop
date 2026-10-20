import React from "react";
import { formatMoney } from "../utils/formatMoney.js";

export function CartDrawer({
  cart,
  checkoutComplete,
  checkoutError,
  checkoutProcessing,
  onCheckout,
  onClose,
  subtotal,
  updateCartQuantity,
}) {
  return (
    <aside className="cart-drawer" aria-label="Shopping cart" data-testid="cart-drawer">
      <div className="cart-panel">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={onClose} aria-label="Close cart">
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
            onClick={onCheckout}
          >
            {checkoutProcessing ? "Opening Checkout..." : "Checkout"}
          </button>
          <p>Secure checkout is powered by Stripe when backend keys are configured.</p>
          {checkoutError && <p className="form-error">{checkoutError}</p>}
          {checkoutComplete && (
            <p className="success">
              Checkout preview created. Add Stripe and Supabase environment
              variables to accept payment.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
