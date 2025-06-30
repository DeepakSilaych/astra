import { put } from "@vercel/blob";

/**
 * Upload a base64 image to Vercel Blob storage
 */
export async function uploadBase64Image(
  base64Data: string,
  filename: string
): Promise<string> {
  try {
    // Extract the actual base64 data (remove data:image/png;base64, prefix)
    const base64Content = base64Data.split(",")[1] || base64Data;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64");

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
    });

    console.log("Uploaded base64 image to blob:", blob.url);
    return blob.url;
  } catch (error) {
    console.error("Error uploading base64 image:", error);
    throw new Error(
      `Failed to upload base64 image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate a unique filename for the scaled jewelry image
 */
export function generateScaledImageFilename(_originalUrl: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  return `scaled-jewelry-${timestamp}-${randomId}.png`;
}
