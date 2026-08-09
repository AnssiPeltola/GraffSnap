import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { uploadToCloudinary, resizeImage } from "@/src/lib/image";
import { cloudinary } from "@/src/lib/cloudinary";
import { createGraffitiSighting } from "@/src/db/repositories/graffiti.repository";
import {
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_MIME,
} from "@/src/lib/validation/graffiti";
import { requireUser } from "@/src/lib/auth/require-user";

type CreateGraffitiActionResult =
  | { success: true; graffitiId: string | number }
  | { success: false; message: string; fieldErrors?: Record<string, string> };

async function validateCoords(
  val: FormDataEntryValue | null,
  min: number,
  max: number,
): Promise<{ ok: true; value: number } | { ok: false; error: string }> {
  if (val == null) return { ok: false, error: "Required" };
  const s = String(val);
  if (s.trim() === "") return { ok: false, error: "Required" };
  const n = Number(s);
  if (!Number.isFinite(n)) return { ok: false, error: "Must be a number" };
  if (n < min || n > max)
    return { ok: false, error: `Must be between ${min} and ${max}` };
  return { ok: true, value: n };
}

export async function POST(req: Request) {
  const formData = await req.formData();

  // Authenticate
  const session = await requireUser();
  // session is expected to be an object with a `user` property containing `id`.
  const sessionTyped = session as unknown;
  type SessionWithUser = { user?: { id?: string | number } };
  let userId: string | null = null;
  if (
    sessionTyped &&
    typeof sessionTyped === "object" &&
    "user" in sessionTyped
  ) {
    const s = sessionTyped as SessionWithUser;
    if (
      s.user &&
      typeof s.user === "object" &&
      "id" in s.user &&
      s.user.id != null
    ) {
      userId = String(s.user.id);
    }
  }

  if (!userId) {
    const res: CreateGraffitiActionResult = {
      success: false,
      message: "Unauthorized",
    };
    return NextResponse.json(res, { status: 401 });
  }

  // Validate fields
  const latVal = await validateCoords(formData.get("latitude"), -90, 90);
  const lngVal = await validateCoords(formData.get("longitude"), -180, 180);
  const notesRaw = formData.get("notes");
  const notes =
    notesRaw && String(notesRaw).trim() !== "" ? String(notesRaw) : null;

  const fieldErrors: Record<string, string> = {};
  if (!latVal.ok) fieldErrors.latitude = latVal.error;
  if (!lngVal.ok) fieldErrors.longitude = lngVal.error;

  const photo = formData.get("photo");
  if (!photo || !(photo instanceof File)) {
    fieldErrors.photo = "Photo is required";
  } else {
    if (photo.size === 0) fieldErrors.photo = "Photo is empty";
    if (photo.size > MAX_IMAGE_SIZE)
      fieldErrors.photo = "Image must be 10 MB or smaller";
    if (photo.type && !ALLOWED_IMAGE_MIME.includes(photo.type))
      fieldErrors.photo = "Unsupported image type";
  }

  if (Object.keys(fieldErrors).length > 0) {
    const res: CreateGraffitiActionResult = {
      success: false,
      message: "Validation failed",
      fieldErrors,
    };
    return NextResponse.json(res, { status: 400 });
  }

  // All validated — process image and insert
  let uploadedPublicId: string | null = null;

  try {
    const photoFile = photo as File;
    const arrayBuffer = await photoFile.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    const processedBuffer = await resizeImage(originalBuffer);

    const uploadResult = (await uploadToCloudinary(
      processedBuffer,
    )) as import("cloudinary").UploadApiResponse;

    uploadedPublicId = uploadResult.public_id;
    const imageUrl = uploadResult.secure_url;

    // Normalize to 6 decimals for NUMERIC(9,6)
    const round6 = (n: number) => (Math.round(n * 1e6) / 1e6).toFixed(6);
    // At this point latVal and lngVal are guaranteed ok (validated above)
    const latStr = round6((latVal as { ok: true; value: number }).value);
    const lngStr = round6((lngVal as { ok: true; value: number }).value);

    const sighting = await createGraffitiSighting({
      userId: String(userId),
      latitude: latStr,
      longitude: lngStr,
      imageUrl,
      imagePublicId: uploadedPublicId,
      notes,
    });

    // Revalidate homepage
    try {
      revalidatePath("/");
    } catch (e) {
      // Non-fatal
      console.error("revalidatePath failed", e);
    }

    const sightingTyped = sighting as { id?: string | number } | undefined;
    const res: CreateGraffitiActionResult = {
      success: true,
      graffitiId: sightingTyped?.id ?? "",
    };
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error("Error creating graffiti sighting:", err);
    // cleanup uploaded image if needed
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch (cleanupErr) {
        console.error("Failed to cleanup Cloudinary asset:", cleanupErr);
      }
    }

    const res: CreateGraffitiActionResult = {
      success: false,
      message: "Could not save graffiti. Please try again.",
    };
    return NextResponse.json(res, { status: 500 });
  }
}
