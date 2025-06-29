import * as fal from "@fal-ai/serverless-client";

type GenerateFinalImageInput = {
  modelImageUrl: string;
  jewelryImageUrl: string;
  prompt: string;
  sizingInfo: string;
};

// The 'fal' client is initialized outside of the function
// to leverage connection reuse.
fal.config({
  proxyUrl: "/api/fal/proxy",
});

const LORAS = [
  {
    path: "https://huggingface.co/latent-consistency/lcm-lora-sdxl/resolve/main/pytorch_lora_weights.safetensors",
    scale: 0.8,
  },
  {
    path: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_offset_example-lora_1.0.safetensors",
    scale: 0.15,
  },
];

export async function generateFinalImage({
  modelImageUrl,
  jewelryImageUrl,
  prompt,
  sizingInfo,
}: GenerateFinalImageInput): Promise<string> {
  console.log("Starting final image generation with inputs:", {
    modelImageUrl,
    jewelryImageUrl,
    prompt,
    sizingInfo,
  });

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
          prompt: "person wearing jewelry",
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
