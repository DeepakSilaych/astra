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
 * Generates a jewelry/accessory image using Fal AI with context-aware prompting
 */
export async function generateJewelryImage(
  prompt: string,
  jewelryCategory?: string,
  userContext?: string
): Promise<GenerationResult> {
  console.log("Generating jewelry image with Fal AI...");
  console.log("Jewelry prompt:", prompt);
  console.log("Jewelry category:", jewelryCategory);
  console.log("User context:", userContext);

  // Build category-specific technical requirements
  let categorySpecs = "";
  switch (jewelryCategory) {
    case "rings":
      categorySpecs =
        "Ring photography: Optimal angles to show band width, setting details, stone placement, ring size proportions, side profile for thickness, top view for stone arrangement, macro detail for texture and engravings";
      break;
    case "necklaces":
      categorySpecs =
        "Necklace photography: Chain drape and flow, clasp detail, length proportions, layering compatibility, pendant interaction if applicable, chain link definition, overall silhouette";
      break;
    case "earrings":
      categorySpecs =
        "Earring photography: Pair symmetry, post and back detail, dangle movement and weight, size scale reference, front and profile angles, material finish and texture, closure mechanism detail";
      break;
    case "bracelets":
      categorySpecs =
        "Bracelet photography: Circumference and fit indication, clasp mechanism detail, link or bead spacing, flexibility demonstration, width and thickness, stacking compatibility, comfort features";
      break;
    case "watches":
      categorySpecs =
        "Watch photography: Face legibility, crown and button detail, band/strap texture and width, case thickness and lugs, movement visibility if applicable, water resistance indicators, brand markings";
      break;
    case "pendants":
      categorySpecs =
        "Pendant photography: Pendant proportions and weight indication, bail detail and chain compatibility, symbolic or design element clarity, dimensional depth, surface texture and finish";
      break;
    case "anklets":
      categorySpecs =
        "Anklet photography: Delicate chain structure, sizing and adjustment features, charm or bead detail, lightweight appearance, closure mechanism, comfortable wear indication";
      break;
    default:
      categorySpecs =
        "General jewelry photography: All design elements clearly visible, scale and proportion accurate, material quality apparent, craftsmanship details highlighted";
  }

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: `LUXURY JEWELRY PRODUCT PHOTOGRAPHY: ${prompt}

CATEGORY SPECIALIZATION: ${categorySpecs}

USER CONTEXT INTEGRATION: ${
          userContext
            ? `Reflecting user specifications: ${userContext}`
            : "Standard luxury presentation"
        }

TECHNICAL MASTERY: Canon EOS R5 + Canon RF 100mm f/2.8L Macro IS USM, ISO 100, f/8, 1/60s, focus stacking for maximum depth of field, tethered shooting for precision control and consistency.

PROFESSIONAL LIGHTING: Three-point lighting with large softboxes, key light 45° above subject, fill lights at 30° angles, white reflector cards surrounding jewelry to eliminate harsh shadows, LED ring light for diamond sparkle enhancement, polarized filters for metal reflection control.

STUDIO ENVIRONMENT: Pure white infinity backdrop, jewelry suspended with invisible fishing line or placed on clear acrylic display stands, dust-free environment, climate controlled for optimal metal/stone appearance, anti-static measures.

JEWELRY PRESENTATION: Perfect positioning showcasing all design elements, diamonds catching light for maximum sparkle and fire, metal surfaces with natural reflections, no fingerprints or dust particles, optimal angle to display craftsmanship and quality.

MATERIAL EXCELLENCE: 18K gold with warm natural luster, VVS1 diamonds with rainbow fire and brilliance, platinum with cool bright finish, gemstones with vibrant color saturation, pearls with natural orient, surface textures clearly defined and tactile.

COMPOSITION ARTISTRY: Centered placement with optimal negative space, multiple angles for complex designs, scale appropriate for virtual try-on applications, consistent lighting across all surfaces, no unwanted reflections or glare.

COLOR FIDELITY: Calibrated monitor setup, proper white balance for accurate metal tones, gemstone colors true to life, no color casts, perfect exposure maintaining detail in highlights and shadows, color accuracy suitable for e-commerce.

FINAL EXCELLENCE: Catalog-quality product photography, 8K resolution, pixel-perfect sharpness throughout, suitable for luxury brand marketing, optimized for virtual jewelry try-on overlay, transparent background ready.`,
        image_size: "square_hd",
        num_inference_steps: 8,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update: {
        status: string;
        logs?: Array<{ message: string }>;
      }) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Jewelry generation progress:", update.status);
          if (update.logs) {
            update.logs.forEach((log) =>
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
