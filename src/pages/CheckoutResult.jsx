import React from "react";
import { Link } from "react-router-dom";

export function CheckoutResult({ status }) {
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
