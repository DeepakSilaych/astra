import { fal } from "@fal-ai/client";

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_KEY,
});

export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generates a jewelry/accessory image using Fal AI
 */
export async function generateJewelryImage(
  prompt: string
): Promise<GenerationResult> {
  console.log("Generating jewelry image with Fal AI...");
  console.log("Jewelry prompt:", prompt);

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: `LUXURY JEWELRY PRODUCT PHOTOGRAPHY: ${prompt}.

TECHNICAL SPECIFICATIONS: Canon EOS R5 + Canon RF 100mm f/2.8L Macro IS USM, ISO 100, f/8, 1/60s, focus stacking for maximum depth of field, tethered shooting for precision.

LIGHTING SETUP: Three-point lighting with large softboxes, key light 45° above subject, fill lights at 30° angles, white reflector cards surrounding jewelry to eliminate harsh shadows, LED ring light for diamond sparkle enhancement.

STUDIO ENVIRONMENT: Pure white infinity backdrop, jewelry suspended with invisible fishing line or placed on clear acrylic display stands, dust-free environment, climate controlled for optimal metal/stone appearance.

JEWELRY PRESENTATION: Perfect positioning showcasing all design elements, diamonds catching light for maximum sparkle, metal surfaces with natural reflections, no fingerprints or dust particles, optimal angle to display craftsmanship.

MATERIAL SPECIFICS: 18K gold with warm luster, VVS1 diamonds with rainbow fire, platinum with cool bright finish, gemstones with vibrant color saturation, pearls with natural orient, surface textures clearly defined.

COMPOSITION: Centered placement with optimal negative space, multiple angles if complex design, scale appropriate for virtual try-on, consistent lighting across all surfaces, no unwanted reflections or glare.

COLOR ACCURACY: Calibrated monitor setup, proper white balance for metal tones, gemstone colors true to life, no color casts, perfect exposure maintaining detail in highlights and shadows.

FINAL OUTPUT: Catalog-quality product photography, 8K resolution, pixel-perfect sharpness, suitable for luxury brand marketing, optimized for virtual jewelry try-on overlay, transparent background optional.`,
        image_size: "square_hd",
        num_inference_steps: 8,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Jewelry generation progress:", update.status);
          if (update.logs) {
            update.logs.forEach((log: any) =>
              console.log("Jewelry Log:", log.message)
            );
          }
        }
      },
    });

    console.log("Jewelry generation result:", result);

    if (result.data && result.data.images && result.data.images.length > 0) {
      const imageUrl = result.data.images[0].url;
      console.log("Jewelry image generated successfully:", imageUrl);
      return {
        success: true,
        imageUrl,
      };
    } else {
      throw new Error("No images generated");
    }
  } catch (error) {
    console.error("Error generating jewelry image:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        error: "Fal AI authentication failed. Please check your FAL_KEY.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
