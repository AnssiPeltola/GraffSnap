import { z } from "zod";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const graffitiSchema = z.object({
  latitude: z.preprocess(
    (val) => {
      if (typeof val === "string")
        return val === "" ? undefined : parseFloat(val);
      return val;
    },
    z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "Latitude is required"
            : "Latitude must be a number",
      })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
  ),

  longitude: z.preprocess(
    (val) => {
      if (typeof val === "string")
        return val === "" ? undefined : parseFloat(val);
      return val;
    },
    z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "Longitude is required"
            : "Longitude must be a number",
      })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
  ),

  // file input: allow File or FileList (we normalize in preprocess)
  photo: z.preprocess(
    (val) => {
      if (!val) return val;

      // FileList-like: has an `item` method
      if (
        typeof val === "object" &&
        val !== null &&
        "item" in val &&
        typeof (val as { item: unknown }).item === "function"
      ) {
        return (val as FileList).item(0);
      }

      if (Array.isArray(val)) return val[0];

      return val;
    },
    z
      .instanceof(File)
      .refine((f) => ALLOWED_IMAGE_MIME.includes(f.type), {
        message: "Unsupported image type",
      })
      .refine((f) => f.size <= MAX_IMAGE_SIZE, {
        message: "Image must be 10 MB or smaller",
      }),
  ),

  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type GraffitiFormData = z.infer<typeof graffitiSchema>;

export default graffitiSchema;
