import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Replicate from "replicate";

export async function GET() {
  try {
    // Test environment variables
    const openaiKey = process.env.OPENAI_API_KEY;
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    return NextResponse.json({
      openaiConfigured: !!openaiKey,
      replicateConfigured: !!replicateToken,
      openaiKeyLength: openaiKey?.length || 0,
      replicateTokenLength: replicateToken?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Test OpenAI connection
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const testResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });

    return NextResponse.json({
      openaiWorking: true,
      response: testResponse.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json(
      {
        openaiWorking: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
