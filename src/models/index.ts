import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  id: string;
  sessionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  data: {
    modelImage?: string;
    jewelryImage?: string;
    sizing?: number;
    description?: string;
    type?: string;
  };
  result?: {
    generatedImageUrl?: string;
    message?: string;
    modelImageUrl?: string;
    jewelryImageUrl?: string;
  };
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const JobSchema = new Schema<IJob>({
  id: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  result: {
    type: Schema.Types.Mixed,
    default: {},
  },
  error: String,
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  completedAt: Date,
});

export interface ISession extends Document {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  jobs: string[]; // Array of job IDs
}

const SessionSchema = new Schema<ISession>({
  id: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  jobs: [{ type: String }],
});

export const Job =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
export const Session =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
