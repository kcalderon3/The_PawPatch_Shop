import { json, methodNotAllowed, readJson } from "../_lib/http.js";
import { requireAdmin } from "../_lib/supabase.js";

const allowedFulfillmentStatuses = new Set([
  "needs_review",
  "design_sent",
  "approved",
  "in_production",
  "shipped",
  "cancelled",
  "refunded",
]);

function send(res, response) {
  res.status(response.statusCode).setHeader("Content-Type", "application/json").end(response.body);
}

async function listOrders(supabase) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,status,fulfillment_status,customer_email,customer_name,shipping_state,total_cents,admin_notes,created_at,order_items(id,product_name,color,size,quantity,order_item_uploads(storage_bucket,storage_path,original_filename))",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  if (!["GET", "PATCH"].includes(req.method)) {
    send(res, methodNotAllowed());
    return;
  }

  const auth = await requireAdmin(req);

  if (auth.error) {
    send(res, json({ error: auth.error }, auth.status));
    return;
  }

  try {
    if (req.method === "GET") {
      send(res, json({ orders: await listOrders(auth.supabase) }));
      return;
    }

    const { orderId, changes = {} } = await readJson(req);

    if (!orderId) {
      send(res, json({ error: "orderId is required." }, 400));
      return;
    }

    const update = {};

    if (typeof changes.admin_notes === "string") {
      update.admin_notes = changes.admin_notes;
    }

    if (changes.fulfillment_status) {
      if (!allowedFulfillmentStatuses.has(changes.fulfillment_status)) {
        send(res, json({ error: "Invalid fulfillment status." }, 400));
        return;
      }

      update.fulfillment_status = changes.fulfillment_status;
    }

    if (!Object.keys(update).length) {
      send(res, json({ ok: true }));
      return;
    }

    const { error } = await auth.supabase
      .from("orders")
      .update(update)
      .eq("id", orderId);

    if (error) throw error;

    send(res, json({ ok: true }));
  } catch (error) {
    send(res, json({ error: error.message || "Admin request failed." }, 500));
  }
}
