import { NextResponse } from "next/server";
import { generateQuizFromNotes } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { notesText } = await request.json();

    if (!notesText || notesText.trim().length < 30) {
      return NextResponse.json(
        { error: "Please provide at least a few sentences of notes." },
        { status: 400 }
      );
    }

    const quiz = await generateQuizFromNotes(notesText);
    return NextResponse.json({ quiz });
  } catch (err) {
    console.error("generate-quiz error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
