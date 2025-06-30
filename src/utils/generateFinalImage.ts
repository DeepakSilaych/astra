import * as fal from "@fal-ai/serverless-client";

type GenerateFinalImageInput = {
  modelImageUrl: string;
  jewelryImageUrl: string;
  prompt: string;
  sizingInfo: string;
  jewelryCategory?: string;
  userContext?: string;
};

// The 'fal' client is initialized outside of the function
// to leverage connection reuse.
fal.config({
  proxyUrl: "/api/fal/proxy",
});

export async function generateFinalImage({
  modelImageUrl,
  jewelryImageUrl,
  prompt,
  sizingInfo,
  jewelryCategory,
  userContext,
}: GenerateFinalImageInput): Promise<string> {

  // Create category-specific prompt
  let categoryPrompt = "person wearing jewelry";

  if (jewelryCategory) {
    switch (jewelryCategory) {
      case "rings":
        categoryPrompt =
          "person wearing a ring on their finger, ring properly sized and positioned on finger, natural hand pose showcasing the ring";
        break;
      case "necklaces":
        categoryPrompt =
          "person wearing a necklace around their neck, necklace properly draped around neck at appropriate length";
        break;
      case "earrings":
        categoryPrompt =
          "person wearing earrings, earrings properly positioned on earlobes, ears clearly visible";
        break;
      case "bracelets":
        categoryPrompt =
          "person wearing a bracelet on their wrist, bracelet properly fitted around wrist";
        break;
      case "watches":
        categoryPrompt =
          "person wearing a watch on their wrist, watch properly positioned on wrist with face visible";
        break;
      case "pendants":
        categoryPrompt =
          "person wearing a pendant necklace, pendant properly positioned on chest area";
        break;
      case "anklets":
        categoryPrompt =
          "person wearing an anklet around their ankle, anklet properly fitted around ankle";
        break;
      default:
        categoryPrompt = "person wearing jewelry";
    }
  }

  // Incorporate user context if available
  // Note: prompt and sizingInfo parameters are available for future use
  void prompt; void sizingInfo;  const finalPrompt = userContext
    ? `${categoryPrompt}, incorporating user preferences: ${userContext}`
    : categoryPrompt;


  console.log("Final prompt for image generation:", finalPrompt);

  try {
    // Use Replicate API directly for better control
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version:
          "8f8d84ebe012e94a126b21c953b8dc33be86e4cf92b133b144bda94aa84e616b",
        input: {
          seed: Math.floor(Math.random() * 10000000000000000),
          prompt: finalPrompt,
          ref_task1: "id",
          ref_image1: modelImageUrl,
          ref_image2: jewelryImageUrl,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Replicate API error: ${response.status} ${response.statusText}`
      );
    }

    const initialResult = await response.json();
    console.log("Replicate job submitted:", initialResult.id);

    // Poll for completion
    let result = initialResult;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait time

    while (result.status === "starting" || result.status === "processing") {
      if (attempts >= maxAttempts) {
        throw new Error("Timeout waiting for Replicate job to complete");
      }

      console.log(`Polling attempt ${attempts + 1}, status: ${result.status}`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const pollResponse = await fetch(result.urls.get, {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error(`Replicate polling error: ${pollResponse.status}`);
      }

      result = await pollResponse.json();
      attempts++;
    }

    console.log("Replicate final image generation result:", result);

    if (result.status === "failed") {
      throw new Error(`Replicate job failed: ${result.error}`);
    }

    if (!result || !result.output) {
      throw new Error(
        "Image generation failed, no output returned from Replicate."
      );
    }

    return result.output;
  } catch (error) {
    console.error("Error generating final image with Replicate:", error);
    throw new Error(
      `Replicate final image generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
