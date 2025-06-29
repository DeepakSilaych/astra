import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function GET() {
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Test with a simple model that doesn't require special permissions
    const output = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: "a simple test image",
          width: 512,
          height: 512,
        },
      }
    );

    return NextResponse.json({
      success: true,
      token: process.env.REPLICATE_API_TOKEN ? "configured" : "missing",
      tokenLength: process.env.REPLICATE_API_TOKEN?.length || 0,
      output: Array.isArray(output) ? output[0] : output,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        token: process.env.REPLICATE_API_TOKEN ? "configured" : "missing",
        tokenLength: process.env.REPLICATE_API_TOKEN?.length || 0,
      },
      { status: 500 }
    );
  }
}
