import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

const UPLOAD_URL = "https://upload.artistfirst.in/upload";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const form = new FormData();
    const buffer = Buffer.from(await file.arrayBuffer());
    form.append("file", buffer, file.name);

    const response = await axios.post(UPLOAD_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const uploadedUrl = response.data?.data?.[0]?.url;

    if (uploadedUrl) {
      return NextResponse.json({ url: uploadedUrl });
    } else {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
