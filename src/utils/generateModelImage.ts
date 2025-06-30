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

  // Build category-specific positioning requirements focused on key body areas
  let positioningRequirements = "";
  let frameComposition = "";
  let bodyFocus = "";
  
  switch (jewelryCategory) {
    case "rings":
      positioningRequirements = "Hands prominently featured as the primary focus, elegant finger positioning with graceful hand gestures, palms facing toward camera when possible, fingers naturally separated and relaxed, nail beds clean and well-manicured, hands positioned at chest or waist level for optimal visibility";
      frameComposition = "Medium close-up shot focusing on upper torso with hands prominently displayed, hands taking up 25-30% of the frame composition";
      bodyFocus = "PRIMARY: Hands and fingers, SECONDARY: Upper body for context";
      break;
    case "necklaces":
      positioningRequirements = "Neck and décolletage as the central focus, chin slightly lifted to elongate neck lines, shoulders positioned to create an elegant neckline frame, collarbone area clearly visible and well-defined, upper chest area prominent but tasteful";
      frameComposition = "Portrait shot from mid-chest up, neck area occupying central 40% of frame composition";
      bodyFocus = "PRIMARY: Neck, décolletage, and collarbone area, SECONDARY: Shoulder line and upper chest";
      break;
    case "earrings":
      positioningRequirements = "Face and ears as the dominant elements, hair styled away from ears to ensure complete ear visibility, head positioned at slight three-quarter angle to show ear shape and lobe definition, jawline and ear curve clearly defined, both ears visible when possible";
      frameComposition = "Head and shoulders portrait, face occupying 50-60% of frame with clear ear definition";
      bodyFocus = "PRIMARY: Ears, earlobes, and side profile, SECONDARY: Facial features and jawline";
      break;
    case "bracelets":
    case "watches":
      positioningRequirements = "Wrists and forearms as the focal point, arms positioned naturally with one or both wrists prominently displayed, hands relaxed and elegant, forearm area clearly visible, wrist bones and contours well-defined, sleeves pushed back or sleeveless to ensure full wrist exposure";
      frameComposition = "Three-quarter body shot with arms/wrists positioned in the prime focal area of the frame";
      bodyFocus = "PRIMARY: Wrists and forearms, SECONDARY: Hand positioning and arm graceful lines";
      break;
    case "pendants":
      positioningRequirements = "Upper chest and sternum area as the centerpiece, neckline that showcases the pendant drop zone effectively, décolletage and upper chest region well-lit and prominent, natural shoulder positioning to frame the pendant area";
      frameComposition = "Upper body portrait highlighting the chest area, sternum region central to composition";
      bodyFocus = "PRIMARY: Upper chest and sternum area, SECONDARY: Neck transition and shoulder frame";
      break;
    case "anklets":
      positioningRequirements = "Lower legs and ankles as the primary subject, feet positioned naturally with ankle bones and contours clearly visible, leg positioning to showcase ankle curves, one foot slightly forward or legs crossed to emphasize ankle area, barefoot or minimal footwear";
      frameComposition = "Lower body shot from mid-calf down, ankles occupying central focus area";
      bodyFocus = "PRIMARY: Ankles and ankle bones, SECONDARY: Lower leg lines and foot positioning";
      break;
    default:
      positioningRequirements = "Balanced full upper body composition with multiple potential placement areas clearly visible, natural confident pose suitable for various accessory types";
      frameComposition = "Standard portrait composition with versatile jewelry placement visibility";
      bodyFocus = "BALANCED: Multiple areas including neck, wrists, and hands for versatile placement options";
  }

  try {
    const result = await fal.subscribe("fal-ai/imagen4/preview", {
      input: {
        prompt: `CONTEXT-AWARE PORTRAIT GENERATION: ${prompt}

JEWELRY CATEGORY OPTIMIZATION: ${jewelryCategory ? `Optimized for ${jewelryCategory} display` : 'General jewelry placement'}

POSITIONING REQUIREMENTS: ${positioningRequirements}

FRAME COMPOSITION: ${frameComposition}

BODY FOCUS: ${bodyFocus}
FRAME COMPOSITION: ${frameComposition}

BODY FOCUS: ${bodyFocus}

USER CONTEXT INTEGRATION: ${userContext ? `Following user preferences: ${userContext}` : 'Standard professional styling'}

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
