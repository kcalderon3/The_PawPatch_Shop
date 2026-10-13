import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const browserSupabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Something went wrong.");
  }

  return payload;
}

export async function fetchProducts() {
  const response = await fetch("/api/products");
  const payload = await parseJsonResponse(response);
  return payload.products;
}

export async function uploadPetPhoto(file) {
  let upload;

  try {
    const response = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }),
    });
    upload = await parseJsonResponse(response);
  } catch (_error) {
    upload = {
      bucket: "local-mock",
      path: `mock-uploads/${Date.now()}-${file.name}`,
      mock: true,
    };
  }

  if (!upload.path) {
    upload = {
      bucket: "local-mock",
      path: `mock-uploads/${Date.now()}-${file.name}`,
      mock: true,
    };
  }

  if (!upload.mock) {
    if (!browserSupabase) {
      throw new Error("Supabase browser environment variables are missing.");
    }

    const { error } = await browserSupabase.storage
      .from(upload.bucket)
      .uploadToSignedUrl(upload.path, upload.token, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message || "Photo upload failed.");
    }
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    storageBucket: upload.bucket,
    storagePath: upload.path,
    mock: Boolean(upload.mock),
  };
}

export async function createCheckoutSession(items) {
  try {
    const response = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    return parseJsonResponse(response);
  } catch (_error) {
    return { mock: true };
  }
}

export async function subscribeEmail(email) {
  try {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return parseJsonResponse(response);
  } catch (_error) {
    return { subscribed: true, mock: true };
  }
}

export async function fetchAdminOrders(accessToken) {
  const response = await fetch("/api/admin/orders", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseJsonResponse(response);
}

export async function updateAdminOrder(accessToken, orderId, changes) {
  const response = await fetch("/api/admin/orders", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, changes }),
  });
  return parseJsonResponse(response);
}
