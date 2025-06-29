import { connectToDatabase } from "../lib/mongodb";
import { Job, IJob, Session, ISession } from "../models/index";
import { nanoid } from "nanoid";
import { processJobData } from "./processJob";

interface JobData {
  modelImage?: string;
  jewelryImage?: string;
  sizing?: number;
  description?: string;
  type?: string;
  sessionId?: string;
}

class JobQueue {
  private processing = new Set<string>();
  private maxConcurrent = 10;

  async add(id: string, data: JobData): Promise<void> {
    await connectToDatabase();

    // Create session if not provided
    let sessionId = data.sessionId;
    if (!sessionId) {
      sessionId = nanoid();
      await Session.create({
        id: sessionId,
        jobs: [id],
      });
    } else {
      // Update existing session
      await Session.findOneAndUpdate(
        { id: sessionId },
        {
          $push: { jobs: id },
          $set: { lastActivity: new Date() },
        },
        { upsert: true }
      );
    }

    await Job.create({
      id,
      sessionId,
      status: "pending",
      data,
    });

    this.process();
  }

  async get(id: string): Promise<IJob | null> {
    await connectToDatabase();
    return Job.findOne({ id });
  }

  async getJobsBySession(sessionId: string): Promise<IJob[]> {
    await connectToDatabase();
    return Job.find({ sessionId }).sort({ createdAt: -1 });
  }

  async createSession(): Promise<string> {
    await connectToDatabase();
    const sessionId = nanoid();
    await Session.create({
      id: sessionId,
      jobs: [],
    });
    return sessionId;
  }

  async getSession(sessionId: string): Promise<ISession | null> {
    await connectToDatabase();
    return Session.findOne({ id: sessionId });
  }

  private async process(): Promise<void> {
    if (this.processing.size >= this.maxConcurrent) return;

    await connectToDatabase();

    const pending = await Job.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .limit(this.maxConcurrent - this.processing.size);

    for (const job of pending) {
      if (this.processing.size >= this.maxConcurrent) break;

      this.processing.add(job.id);
      job.status = "processing";
      job.startedAt = new Date();
      await job.save();

      this.executeJob(job).finally(() => {
        this.processing.delete(job.id);
        this.process();
      });
    }
  }

  private async executeJob(job: IJob): Promise<void> {
    try {
      const result = await processJobData(job.data);

      job.result = result;
      job.status = "completed";
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
    }
    job.completedAt = new Date();
    await job.save();
  }
}

export const jobQueue = new JobQueue();
