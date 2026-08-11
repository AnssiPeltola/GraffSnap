import sharp from "sharp";
import { cloudinary } from "../lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export async function resizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({
      width: 1200,
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
    })
    .toBuffer();
}

export async function uploadToCloudinary(
  buffer: Buffer,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "graffsnap",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}
