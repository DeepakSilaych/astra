import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test MongoDB connection
    const { connectToDatabase } = await import("@/lib/mongodb");
    const { Job, Session } = await import("@/models/index");

    await connectToDatabase();

    // Get some basic stats
    const jobCount = await Job.countDocuments();
    const sessionCount = await Session.countDocuments();

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      stats: {
        totalJobs: jobCount,
        totalSessions: sessionCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
