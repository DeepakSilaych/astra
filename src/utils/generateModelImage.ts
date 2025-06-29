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
 * Generates a model/person image using Fal AI
 */
export async function generateModelImage(
  prompt: string
): Promise<GenerationResult> {
  console.log("Generating model image with Fal AI...");
  console.log("Model prompt:", prompt);

  try {
    const result = await fal.subscribe("fal-ai/imagen4/preview", {
      input: {
        prompt: `CLEAN PORTRAIT: ${prompt}. 

CRITICAL REQUIREMENT: The person must have ABSOLUTELY NO accessories of any kind - no necklaces, no earrings, no rings, no bracelets, no decorative items. Clean bare neck, clean bare ears, clean bare hands.

TECHNICAL SPECIFICATIONS: Canon EOS R5 + RF 85mm f/1.2L, ISO 100, f/2.8, 1/125s, studio strobes with softboxes, color temperature 5600K, shot at eye level.

LIGHTING SETUP: Key light 45° camera right with 36" octagon softbox, fill light camera left at 1/2 power, hair light from behind-above with snoot, white seamless backdrop with gradient lighting from bottom.

PERSON REQUIREMENTS: Professional portrait, age 20-35, clear porcelain skin, natural makeup with defined features, eyes looking directly at camera with confident expression, shoulders square to camera, head tilted 15° for dynamic pose.

POSITIONING: Neck completely bare and clearly visible, ears fully exposed with hair styled back or to one side, décolletage area clean and well-lit, hands positioned elegantly if visible, perfect posture. ZERO accessories OR decorative items OF ANY KIND.

BACKGROUND & COMPOSITION: Pure white seamless background with subtle gradient, person centered in frame with breathing room, rule of thirds composition, negative space optimized.

POST-PRODUCTION QUALITY: Skin retouched to perfection while maintaining natural texture, eyes bright and sharp, hair with natural shine and volume, colors balanced, shadows soft but defined.

MANDATORY: No accessories, no necklaces, no earrings, no decorative items - completely clean portrait.`,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Model generation progress:", update.status);
          if (update.logs) {
            update.logs.forEach((log: any) =>
              console.log("Model Log:", log.message)
            );
          }
        }
      },
    });

    console.log("Model generation result:", result);

    if (result.data && result.data.images && result.data.images.length > 0) {
      const imageUrl = result.data.images[0].url;
      console.log("Model image generated successfully:", imageUrl);
      return {
        success: true,
        imageUrl,
      };
    } else {
      throw new Error("No images generated");
    }
  } catch (error) {
    console.error("Error generating model image:", error);

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
