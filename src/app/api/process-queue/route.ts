import { NextRequest, NextResponse } from "next/server";
import { jobQueue } from "@/utils/queue";
import { nanoid } from "nanoid";

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

    const jobId = nanoid();

    // Add job to queue
    await jobQueue.add(jobId, {
      description: prompt,
      modelImage: referenceImages?.find(
        (img: { type: string; url?: string }) => img.type === "model"
      )?.url,
      jewelryImage: referenceImages?.find(
        (img: { type: string; url?: string }) => img.type === "jewelry"
      )?.url,
      sizing: sizingInfo ? parseInt(sizingInfo) : undefined,
      type: "virtual-tryson",
    });

    return NextResponse.json({
      jobId,
      status: "queued",
      message: "Job added to processing queue",
    });
  } catch (error) {
    console.error("Queue processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to queue job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("id");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID required" }, { status: 400 });
  }

  try {
    const job = await jobQueue.get(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}
