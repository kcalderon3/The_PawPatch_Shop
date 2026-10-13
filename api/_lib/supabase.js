import { createClient } from "@supabase/supabase-js";

export const uploadBucket = process.env.SUPABASE_UPLOAD_BUCKET || "pet-photos";

export function hasSupabaseAdminEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  if (!hasSupabaseAdminEnv()) return null;

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(req) {
  const supabase = getSupabaseAdmin();
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!supabase || !token) {
    return { error: "Admin authentication is not configured.", status: 401 };
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.email) {
    return { error: "Invalid admin session.", status: 401 };
  }

  const adminEmails = getAdminEmails();
  const email = data.user.email.toLowerCase();

  if (!adminEmails.includes(email)) {
    return { error: "This email is not approved for admin access.", status: 403 };
  }

  return { supabase, user: data.user };
}
