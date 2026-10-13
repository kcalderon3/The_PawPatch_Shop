import Stripe from "stripe";
import { getOrigin, json, methodNotAllowed, readJson } from "../_lib/http.js";
import { validateCartItems } from "../_lib/products.js";
import { getSupabaseAdmin } from "../_lib/supabase.js";

function send(res, response) {
  res.status(response.statusCode).setHeader("Content-Type", "application/json").end(response.body);
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function toCents(value) {
  return Math.round(Number(value) * 100);
}

function absoluteImage(origin, image) {
  if (!image) return undefined;
  return image.startsWith("http") ? image : `${origin}${image}`;
}

async function createPendingOrder(supabase, validatedItems) {
  const subtotalCents = validatedItems.reduce(
    (sum, item) => sum + toCents(item.product.price) * item.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      fulfillment_status: "needs_review",
      subtotal_cents: subtotalCents,
      tax_cents: 0,
      total_cents: subtotalCents,
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  for (const item of validatedItems) {
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price_cents: toCents(item.product.price),
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      })
      .select("id")
      .single();

    if (itemError) throw itemError;

    if (item.petPhoto?.storagePath) {
      const { error: uploadError } = await supabase.from("order_item_uploads").insert({
        order_item_id: orderItem.id,
        storage_bucket: item.petPhoto.storageBucket,
        storage_path: item.petPhoto.storagePath,
        original_filename: item.petPhoto.name,
        mime_type: item.petPhoto.type,
        file_size: item.petPhoto.size,
      });

      if (uploadError) throw uploadError;
    }
  }

  return order.id;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    send(res, methodNotAllowed());
    return;
  }

  try {
    const stripe = getStripe();
    const supabase = getSupabaseAdmin();
    const { items } = await readJson(req);
    const validatedItems = await validateCartItems(items);

    if (!stripe) {
      send(res, json({ mock: true }));
      return;
    }

    if (!supabase) {
      send(res, json({ error: "Supabase is required for live checkout." }, 500));
      return;
    }

    const origin = getOrigin(req);
    const orderId = await createPendingOrder(supabase, validatedItems);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Free continental US shipping",
          },
        },
      ],
      line_items: validatedItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: toCents(item.product.price),
          product_data: {
            name: item.product.name,
            description: `${item.color} / ${item.size}`,
            images: [absoluteImage(origin, item.product.images[0])].filter(Boolean),
            metadata: {
              productId: item.product.id,
              color: item.color,
              size: item.size,
              uploadPath: item.petPhoto?.storagePath || "",
            },
          },
        },
      })),
      metadata: { orderId },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    const { error } = await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);

    if (error) throw error;

    send(res, json({ url: session.url, orderId }));
  } catch (error) {
    send(res, json({ error: error.message || "Could not create checkout." }, 400));
  }
}
