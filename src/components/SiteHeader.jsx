import React from "react";
import { Link, NavLink } from "react-router-dom";

export function SiteHeader({ cartCount, onCartOpen }) {
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
