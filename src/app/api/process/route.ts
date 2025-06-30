import { NextRequest, NextResponse } from "next/server";
import {
  analyzeRequest,
  generateFinalImage,
  generateJewelryImage,
  generateModelImage,
  type AnalysisResult,
} from "@/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, referenceImages, sizingInfo } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Processing request:", {
      prompt,
      sizingInfo,
      imageCount: referenceImages?.length || 0,
    });

    // Step 1: Analyze the request using OpenAI
    let analysis: AnalysisResult;
    try {
      analysis = await analyzeRequest(prompt, referenceImages);
    } catch (error) {
      console.error("Analysis error:", error);
      return NextResponse.json(
        {
          error: "Failed to analyze request",
          details: error instanceof Error ? error.message : "Analysis failed",
        },
        { status: 500 }
      );
    }

    let modelImageUrl: string | undefined = referenceImages?.find(
      (img: { type: string }) => img.type === "model"
    )?.url;

    let jewelryImageUrl: string | undefined = referenceImages?.find(
      (img: { type: string }) => img.type === "jewelry"
    )?.url;

    // Fallback logic: if we don't have typed images, infer from the generation needs
    if (
      !jewelryImageUrl &&
      !analysis.needsJewelryGeneration &&
      referenceImages?.length > 0
    ) {
      // If we don't need to generate jewelry, the reference image must be jewelry
      jewelryImageUrl = referenceImages[0].url;
      console.log("Inferred jewelry image from reference:", jewelryImageUrl);
    }

    // Debug logs
    console.log("Reference images:", referenceImages);
    console.log("Extracted modelImageUrl:", modelImageUrl);
    console.log("Extracted jewelryImageUrl:", jewelryImageUrl);

    // Step 2: Generate model image if needed
    if (analysis.needsModelGeneration && analysis.suggestedModelPrompt) {
      console.log("Model generation required");

      const modelResult = await generateModelImage(
        analysis.suggestedModelPrompt,
        analysis.jewelryCategory,
        prompt // Pass user's original request as context
      );

      if (!modelResult.success) {
        // If authentication fails, we'll skip model generation and proceed
        if (modelResult.error?.includes("authentication")) {
          console.log(
            "Fal AI authentication failed. Proceeding without model generation."
          );
          analysis.needsModelGeneration = false;
        } else {
          return NextResponse.json(
            {
              error: "Failed to generate model image",
              details: modelResult.error,
            },
            { status: 500 }
          );
        }
      } else {
        modelImageUrl = modelResult.imageUrl || undefined;
      }
    } else {
      console.log(
        "Skipping model generation - not needed or using provided images"
      );
    }

    // Step 3: Generate jewelry image if needed
    if (analysis.needsJewelryGeneration && analysis.suggestedJewelryPrompt) {
      console.log("Jewelry generation required");

      const jewelryResult = await generateJewelryImage(
        analysis.suggestedJewelryPrompt,
        analysis.jewelryCategory,
        prompt // Pass user's original request as context
      );

      if (!jewelryResult.success) {
        return NextResponse.json(
          {
            error: "Failed to generate jewelry image",
            details: jewelryResult.error,
          },
          { status: 500 }
        );
      } else {
        jewelryImageUrl = jewelryResult.imageUrl || undefined;
      }
    } else {
      console.log(
        "Skipping jewelry generation - not needed or using provided images"
      );
    }

    // Step 4: Generate final try-on image
    if (!modelImageUrl || !jewelryImageUrl) {
      return NextResponse.json(
        {
          error:
            "Both model and jewelry images are required for the final step.",
        },
        { status: 400 }
      );
    }

    console.log("Generating final try-on image...");

    try {
      const finalImageUrl = await generateFinalImage({
        modelImageUrl,
        jewelryImageUrl,
        prompt,
        sizingInfo,
        jewelryCategory: analysis.jewelryCategory,
        userContext: prompt,
      });

      // Return the results
      return NextResponse.json({
        success: true,
        generatedImageUrl: finalImageUrl,
      });
    } catch (error) {
      console.error("Processing error:", error);
      return NextResponse.json(
        {
          error: "Failed to generate final image",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
