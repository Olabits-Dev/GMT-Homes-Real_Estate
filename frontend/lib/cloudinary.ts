import "server-only";

import { createHash } from "node:crypto";
import { getCloudinaryConfig } from "@/lib/server-env";
import type { PropertyImageAsset } from "@/types/property";

function createUploadSignature(input: {
  folder: string;
  timestamp: string;
  apiSecret: string;
}) {
  return createHash("sha1")
    .update(`folder=${input.folder}&timestamp=${input.timestamp}${input.apiSecret}`)
    .digest("hex");
}

export function isCloudinaryConfigured() {
  return getCloudinaryConfig() !== null;
}

export async function uploadPropertyImages(files: File[]) {
  if (files.length === 0) {
    return [] satisfies PropertyImageAsset[];
  }

  const config = getCloudinaryConfig();

  if (!config) {
    throw new Error(
      "Cloud image uploads are not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable real uploads.",
    );
  }

  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = createUploadSignature({
        apiSecret: config.apiSecret,
        folder: config.folder,
        timestamp,
      });
      const formData = new FormData();

      formData.set("file", file);
      formData.set("api_key", config.apiKey);
      formData.set("folder", config.folder);
      formData.set("signature", signature);
      formData.set("timestamp", timestamp);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
        {
          body: formData,
          cache: "no-store",
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          "The cloud image upload failed. Check the Cloudinary credentials and try again.",
        );
      }

      const payload = (await response.json()) as {
        height?: number;
        public_id?: string;
        secure_url?: string;
        width?: number;
      };

      if (!payload.secure_url) {
        throw new Error("The cloud image upload completed without a usable image URL.");
      }

      return {
        fileName: file.name,
        height: payload.height ?? null,
        publicId: payload.public_id ?? null,
        url: payload.secure_url,
        width: payload.width ?? null,
      } satisfies PropertyImageAsset;
    }),
  );

  return uploadedImages;
}
