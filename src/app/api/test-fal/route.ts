import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function GET() {
  try {
    // Check if FAL_KEY is configured
    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        {
          status: "error",
          message: "FAL_KEY environment variable is not set",
        },
        { status: 400 }
      );
    }

    // Try a simple API call to test authentication
    try {
      // This is a lightweight test with minimal parameters
      const testResult = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: "test authentication",
          image_size: "square_hd",
          num_inference_steps: 1,
          num_images: 1,
        },
      });

      return NextResponse.json({
        status: "success",
        message: "Fal AI authentication and generation successful",
        hasResult: !!testResult.data,
      });
    } catch (authError: any) {
      if (authError.status === 401) {
        return NextResponse.json(
          {
            status: "error",
            message: "Fal AI authentication failed - invalid API key",
            details: "Please check your FAL_KEY in .env.local",
          },
          { status: 401 }
        );
      }

      throw authError;
    }
  } catch (error) {
    console.error("Fal AI test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to test Fal AI connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
