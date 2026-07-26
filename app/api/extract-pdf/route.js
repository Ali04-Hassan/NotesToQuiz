import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    return NextResponse.json({ text: result.text });
  } catch (err) {
    console.error("extract-pdf error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract PDF text" },
      { status: 500 }
    );
  }
}
