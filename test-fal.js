const { fal } = require("@fal-ai/client");
require("dotenv").config({ path: ".env.local" });

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_KEY,
});

async function testFalAI() {
  try {
    console.log("Testing Fal AI connection...");

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: "a simple test image of a red apple",
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Status:", update.status);
        if (update.logs) {
          update.logs.forEach((log) => console.log("Log:", log.message));
        }
      },
    });

    console.log("Result:", result);

    if (result.data && result.data.images && result.data.images.length > 0) {
      console.log("Success! Generated image URL:", result.data.images[0].url);
    } else {
      console.log("No images generated");
    }
  } catch (error) {
    console.error("Error:", error);
    if (error.body) {
      console.error("Error body:", error.body);
    }
  }
}

testFalAI();
