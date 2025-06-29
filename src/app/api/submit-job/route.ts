import { NextRequest, NextResponse } from "next/server";
import { jobQueue } from "@/utils/queue";
import { nanoid } from "nanoid";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const jewelryImage = data.get("jewelryImage") as File;
    const modelImage = data.get("modelImage") as File | null;
    const prompt = data.get("prompt") as string | null;
    const sizing = data.get("sizing") as string;

    if (!jewelryImage || !sizing) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save files
    const jewelryImageBuffer = Buffer.from(await jewelryImage.arrayBuffer());
    const jewelryImagePath = join(uploadsDir, jewelryImage.name);
    await writeFile(jewelryImagePath, jewelryImageBuffer);

    let modelImagePath: string | undefined;
    if (modelImage) {
      const modelImageBuffer = Buffer.from(await modelImage.arrayBuffer());
      modelImagePath = join(uploadsDir, modelImage.name);
      await writeFile(modelImagePath, modelImageBuffer);
    }

    // Create job using MongoDB queue
    const jobId = nanoid();
    await jobQueue.add(jobId, {
      description: prompt || "Virtual jewelry try-on",
      jewelryImage: `/uploads/${jewelryImage.name}`,
      modelImage: modelImage ? `/uploads/${modelImage.name}` : undefined,
      sizing: parseInt(sizing),
      type: "jewelry",
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
