import React from "react";

export function Footer({
  email,
  galleryImages,
  onEmailChange,
  onSubmit,
  subscribeError,
  subscribed,
}) {
  return (
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
        <form onSubmit={onSubmit}>
          <h2 className="footer-subscribe-title">Subscribe</h2>
          <p>Be the first to hear about sales and new product releases.</p>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            aria-label="Email address"
          />
          <button className="secondary-button">Sign Up</button>
          {subscribed && <span className="success">You are on the list.</span>}
          {subscribeError && <span className="form-error">{subscribeError}</span>}
        </form>
        <SocialLinks />
      </div>
    </footer>
  );
}

function SocialLinks() {
  return (
    <div className="socials" aria-label="Social links">
      <a href="https://www.instagram.com/the.paw.patch/" aria-label="Instagram">
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
      <a href="https://www.tiktok.com/@the.paw.patch" aria-label="TikTok">
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
  );
}
