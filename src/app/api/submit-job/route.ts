import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/queue";
import { writeFile } from "fs/promises";
import { join } from "path";

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

    // Save files
    const jewelryImageBuffer = Buffer.from(await jewelryImage.arrayBuffer());
    const jewelryImagePath = join(
      process.cwd(),
      "public",
      "uploads",
      jewelryImage.name
    );
    await writeFile(jewelryImagePath, jewelryImageBuffer);

    let modelImagePath: string | undefined;
    if (modelImage) {
      const modelImageBuffer = Buffer.from(await modelImage.arrayBuffer());
      modelImagePath = join(
        process.cwd(),
        "public",
        "uploads",
        modelImage.name
      );
      await writeFile(modelImagePath, modelImageBuffer);
    }

    const job = createJob({
      jewelryImagePath,
      modelImagePath,
      prompt: prompt ?? undefined,
      sizing,
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
