import { json, methodNotAllowed, readJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

function send(res, response) {
  res.status(response.statusCode).setHeader("Content-Type", "application/json").end(response.body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    send(res, methodNotAllowed());
    return;
  }

  try {
    const { email } = await readJson(req);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      send(res, json({ error: "Enter a valid email address." }, 400));
      return;
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      send(res, json({ subscribed: true, mock: true }));
      return;
    }

    const { error } = await supabase
      .from("subscribers")
      .upsert(
        { email: normalizedEmail, source: "footer" },
        { onConflict: "email" },
      );

    if (error) throw error;

    send(res, json({ subscribed: true }));
  } catch (error) {
    send(res, json({ error: error.message || "Could not subscribe." }, 500));
  }
}
