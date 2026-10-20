import React, { useState } from "react";
import { Link } from "react-router-dom";
import { faqs } from "../data/storefront.js";

export function FaqPage() {
  const [openFaq, setOpenFaq] = useState(0);

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
