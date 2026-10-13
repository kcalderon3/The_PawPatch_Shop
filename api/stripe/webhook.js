import Stripe from "stripe";
import { json, methodNotAllowed } from "../_lib/http.js";
import { getAdminEmails, getSupabaseAdmin } from "../_lib/supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function send(res, response) {
  res.status(response.statusCode).setHeader("Content-Type", "application/json").end(response.body);
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function extractShipping(session) {
  const details = session.shipping_details;
  const address = details?.address || {};

  return {
    customer_name: details?.name || session.customer_details?.name || null,
    customer_email: session.customer_details?.email || session.customer_email || null,
    shipping_line1: address.line1 || null,
    shipping_line2: address.line2 || null,
    shipping_city: address.city || null,
    shipping_state: address.state || null,
    shipping_postal_code: address.postal_code || null,
    shipping_country: address.country || null,
  };
}

async function notifyAdmin(orderId, session) {
  if (!process.env.RESEND_API_KEY) return;

  const recipients = getAdminEmails();
  if (!recipients.length) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.ORDER_EMAIL_FROM || "The Paw Patch <orders@thepawpatch.shop>",
      to: recipients,
      subject: `New The Paw Patch order ${orderId}`,
      html: `<p>A new paid order is ready for review.</p><p><strong>Order:</strong> ${orderId}</p><p><strong>Customer:</strong> ${session.customer_details?.email || "Unknown"}</p>`,
    }),
  }).catch((error) => {
    console.error("Could not send admin order email", error);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    send(res, methodNotAllowed());
    return;
  }

  const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
  const supabase = getSupabaseAdmin();

  if (!stripe || !supabase || !process.env.STRIPE_WEBHOOK_SECRET) {
    send(res, json({ error: "Webhook is not configured." }, 500));
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const update = {
          status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent || null,
          subtotal_cents: session.amount_subtotal || 0,
          tax_cents: session.total_details?.amount_tax || 0,
          total_cents: session.amount_total || 0,
          paid_at: new Date().toISOString(),
          ...extractShipping(session),
        };

        const reviewStates = ["AK", "HI", "PR", "GU", "VI", "AS", "MP"];
        if (reviewStates.includes(update.shipping_state)) {
          update.admin_notes =
            "Review shipping address: outside continental US fulfillment policy.";
        }

        const { error } = await supabase.from("orders").update(update).eq("id", orderId);
        if (error) throw error;

        await notifyAdmin(orderId, session);
      }
    }

    send(res, json({ received: true }));
  } catch (error) {
    send(res, json({ error: error.message || "Webhook failed." }, 400));
  }
}
