import mongoose from "mongoose";

const connectionCache: { conn: typeof mongoose | null } = { conn: null };

export async function connectToDatabase() {
  if (connectionCache.conn) {
    return connectionCache.conn;
  }

  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb://admin:password@localhost:27017/astra?authSource=admin";

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    connectionCache.conn = conn;
    return conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
