import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("UPSTASH_REDIS_REST_URL is not set");
}
if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_TOKEN is not set");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "10 s"),
});

export async function POST(request: Request) {
  const { success } = await ratelimit.limit("generate");
  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }

  const { jewelryImage, modelImage, sizing, model } = await request.json();

  // TODO: Add logic to call the AI model

  return NextResponse.json({ result: "success" });
}
