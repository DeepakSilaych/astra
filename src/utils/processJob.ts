import { analyzeRequest } from "./analyzeRequest";
import { generateModelImage } from "./generateModelImage";
import { generateJewelryImage } from "./generateJewelryImage";
import { generateFinalImage } from "./generateFinalImage";

interface JobData {
  modelImage?: string;
  jewelryImage?: string;
  sizing?: number;
  description?: string;
  type?: string;
}

interface JobResult {
  generatedImageUrl?: string;
  message?: string;
  modelImageUrl?: string;
  jewelryImageUrl?: string;
}

export async function processJobData(data: JobData): Promise<JobResult> {
  try {
    console.log("Processing job with data:", data);

    // Step 1: Analyze the request (with empty array for referenceImages for now)
    const analysis = await analyzeRequest(data.description || "", []);
    console.log("Analysis result:", analysis);

    let modelImageUrl = data.modelImage;
    let jewelryImageUrl = data.jewelryImage;

    // Step 2: Generate model image if needed
    if (
      !modelImageUrl &&
      analysis.needsModelGeneration &&
      analysis.suggestedModelPrompt
    ) {
      console.log("Generating model image with context...");
      const modelResult = await generateModelImage(
        analysis.suggestedModelPrompt,
        analysis.jewelryCategory,
        data.description // Pass user's original request as context
      );
      if (modelResult.success && modelResult.imageUrl) {
        modelImageUrl = modelResult.imageUrl;
        console.log("Generated model image URL:", modelImageUrl);
      } else {
        throw new Error(`Model generation failed: ${modelResult.error}`);
      }
    }

    // Step 3: Generate jewelry image if needed
    if (
      !jewelryImageUrl &&
      analysis.needsJewelryGeneration &&
      analysis.suggestedJewelryPrompt
    ) {
      console.log("Generating jewelry image with context...");
      const jewelryResult = await generateJewelryImage(
        analysis.suggestedJewelryPrompt,
        analysis.jewelryCategory,
        data.description // Pass user's original request as context
      );
      if (jewelryResult.success && jewelryResult.imageUrl) {
        jewelryImageUrl = jewelryResult.imageUrl;
        console.log("Generated jewelry image URL:", jewelryImageUrl);
      } else {
        throw new Error(`Jewelry generation failed: ${jewelryResult.error}`);
      }
    }

    // Step 4: Generate final try-on image
    if (modelImageUrl && jewelryImageUrl) {
      console.log("Generating final try-on image...");
      const finalImageUrl = await generateFinalImage({
        modelImageUrl,
        jewelryImageUrl,
        prompt: analysis.suggestedModelPrompt || "Virtual jewelry try-on",
        sizingInfo: data.sizing ? `Size: ${data.sizing}` : "Standard sizing",
        jewelryCategory: analysis.jewelryCategory,
        userContext: data.description,
      });
      console.log("Generated final image URL:", finalImageUrl);

      return {
        generatedImageUrl: finalImageUrl,
        modelImageUrl,
        jewelryImageUrl,
        message: "Virtual try-on completed successfully!",
      };
    } else {
      // If we don't have both images, return what we have
      return {
        modelImageUrl,
        jewelryImageUrl,
        message:
          "Partial generation completed. Missing some images for final try-on.",
      };
    }
  } catch (error) {
    console.error("Error processing job:", error);
    throw error;
  }
}
