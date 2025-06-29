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
 * Generates a model/person image using Fal AI with context-aware prompting
 */
export async function generateModelImage(
  prompt: string,
  jewelryCategory?: string,
  userContext?: string
): Promise<GenerationResult> {
  console.log("Generating model image with Fal AI...");
  console.log("Model prompt:", prompt);
  console.log("Jewelry category:", jewelryCategory);
  console.log("User context:", userContext);

  // Build category-specific positioning requirements
  let positioningRequirements = "";
  switch (jewelryCategory) {
    case "rings":
      positioningRequirements =
        "Hands prominently displayed with elegant finger positioning, palms visible or gracefully posed, nail beds clean and well-manicured, fingers naturally separated to showcase ring placement areas";
      break;
    case "necklaces":
      positioningRequirements =
        "Upper body and neck area clearly visible, décolletage well-lit, appropriate neckline for jewelry layering, shoulders positioned to frame the neck area naturally";
      break;
    case "earrings":
      positioningRequirements =
        "Face and ear areas clearly visible, hair styled to expose ears completely, head positioned to show ear shape and lobe clearly, profile and front angles optimized";
      break;
    case "bracelets":
    case "watches":
      positioningRequirements =
        "Wrists and forearms clearly visible, arms positioned naturally with wrist areas prominently displayed, hands relaxed and elegant, sleeves appropriate for wrist exposure";
      break;
    case "pendants":
      positioningRequirements =
        "Chest area visible with clear pendant placement zone, neckline appropriate for pendant display, upper body positioning to showcase pendant drop area";
      break;
    case "anklets":
      positioningRequirements =
        "Lower legs and ankles clearly visible, feet positioned naturally, ankle area well-lit and unobstructed, appropriate footwear or barefoot styling";
      break;
    default:
      positioningRequirements =
        "Full upper body visible with clear jewelry placement areas, natural pose suitable for accessory display";
  }

  try {
    const result = await fal.subscribe("fal-ai/imagen4/preview", {
      input: {
        prompt: `CONTEXT-AWARE PORTRAIT GENERATION: ${prompt}

JEWELRY CATEGORY OPTIMIZATION: ${
          jewelryCategory
            ? `Optimized for ${jewelryCategory} display`
            : "General jewelry placement"
        }

POSITIONING REQUIREMENTS: ${positioningRequirements}

USER CONTEXT INTEGRATION: ${
          userContext
            ? `Following user preferences: ${userContext}`
            : "Standard professional styling"
        }

CRITICAL REQUIREMENTS: The person must have ABSOLUTELY NO accessories, jewelry, or decorative items of any kind - completely clean and bare in all jewelry placement areas.

TECHNICAL EXCELLENCE: Canon EOS R5 + RF 85mm f/1.2L, ISO 100, f/2.8, 1/125s, studio strobes with softboxes, color temperature 5600K, shot at eye level for professional quality.

LIGHTING MASTERY: Key light 45° camera right with 36" octagon softbox, fill light camera left at 1/2 power, hair light from behind-above with snoot, white seamless backdrop with gradient lighting from bottom.

SUBJECT SPECIFICATIONS: Professional portrait quality, natural makeup with defined features, eyes with confident expression and direct camera contact, natural skin texture with professional retouching.

COMPOSITION PERFECTION: Rule of thirds composition, negative space optimized for jewelry overlay, perfect posture with natural confidence, breathing room in frame, centered positioning.

BACKGROUND & POST: Pure white seamless background with subtle gradient, colors balanced, shadows soft but defined, skin perfected while maintaining natural texture, eyes bright and sharp.

MANDATORY EXCLUSIONS: Zero accessories, no jewelry, no decorative items, no hair accessories - completely clean portrait optimized for virtual jewelry try-on.`,
      },
      logs: true,
      onQueueUpdate: (update: {
        status: string;
        logs?: Array<{ message: string }>;
      }) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Model generation progress:", update.status);
          if (update.logs) {
            update.logs.forEach((log) =>
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
