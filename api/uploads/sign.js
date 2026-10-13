import crypto from "node:crypto";
import { json, methodNotAllowed, readJson } from "../_lib/http.js";
import { getSupabaseAdmin, uploadBucket } from "../_lib/supabase.js";

const maxUploadBytes = 15 * 1024 * 1024;

function send(res, response) {
  res.status(response.statusCode).setHeader("Content-Type", "application/json").end(response.body);
}

function safeExtension(fileName = "", fileType = "") {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  const fromType = fileType.split("/").pop()?.toLowerCase();
  const extension = fromName || fromType || "jpg";
  return extension.replace(/[^a-z0-9]/g, "").slice(0, 8) || "jpg";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    send(res, methodNotAllowed());
    return;
  }

  try {
    const { fileName, fileSize, fileType } = await readJson(req);

    if (!fileType?.startsWith("image/")) {
      send(res, json({ error: "Please upload an image file." }, 400));
      return;
    }

    if (!Number.isFinite(fileSize) || fileSize > maxUploadBytes) {
      send(res, json({ error: "Pet photo must be smaller than 15MB." }, 400));
      return;
    }

    const id = crypto.randomUUID();
    const extension = safeExtension(fileName, fileType);
    const path = `pet-photos/${new Date().toISOString().slice(0, 10)}/${id}.${extension}`;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      send(res, json({ bucket: uploadBucket, path, mock: true }));
      return;
    }

    const { data, error } = await supabase.storage
      .from(uploadBucket)
      .createSignedUploadUrl(path);

    if (error) {
      throw error;
    }

    send(res, json({ bucket: uploadBucket, path, token: data.token, signedUrl: data.signedUrl }));
  } catch (error) {
    send(res, json({ error: error.message || "Could not create upload URL." }, 500));
  }
}
