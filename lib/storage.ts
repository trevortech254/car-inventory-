import { supabase } from "./supabaseClient";

const CAR_PHOTOS_BUCKET = "car-photos";

export function isValidCarPhotoPublicUrl(url: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  const expectedPrefix = `${base}/storage/v1/object/public/${CAR_PHOTOS_BUCKET}/`;
  return url.startsWith(expectedPrefix);
}

export async function uploadCarPhoto(file: File, ownerId: string) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeExt = (extension ?? "jpg").toLowerCase();
  const filePath = `${ownerId}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage.from(CAR_PHOTOS_BUCKET).upload(filePath, file, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CAR_PHOTOS_BUCKET).getPublicUrl(filePath);

  if (!isValidCarPhotoPublicUrl(publicUrl)) {
    throw new Error("Generated public URL does not match Supabase public URL format for car-photos.");
  }

  return { filePath, publicUrl };
}

export { CAR_PHOTOS_BUCKET };
