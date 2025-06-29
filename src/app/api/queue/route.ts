import { NextRequest, NextResponse } from "next/server";
import { jobQueue } from "@/utils/queue";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobId = nanoid();

    // Get or create session
    let sessionId = body.sessionId;
    if (!sessionId) {
      sessionId = await jobQueue.createSession();
    }

    await jobQueue.add(jobId, { ...body, sessionId });

    return NextResponse.json({ jobId, sessionId });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("id");
  const sessionId = searchParams.get("sessionId");

  try {
    if (sessionId && !jobId) {
      // Get all jobs for a session
      const jobs = await jobQueue.getJobsBySession(sessionId);
      return NextResponse.json({ jobs });
    }

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID or Session ID required" },
        { status: 400 }
      );
    }

    const job = await jobQueue.get(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job(s):", error);
    return NextResponse.json(
      { error: "Failed to fetch job(s)" },
      { status: 500 }
    );
  }
}
