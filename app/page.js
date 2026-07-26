"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function Home() {
  const router = useRouter();
  const [notesText, setNotesText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file, or paste your notes as text below.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to read PDF");
      setNotesText(data.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!notesText || notesText.trim().length < 30) {
      setError("Paste or upload at least a paragraph of notes first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notesText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");

      const quizId = `quiz_${Date.now()}`;
      const quizRecord = {
        id: quizId,
        createdAt: new Date().toISOString(),
        sourcePreview: notesText.slice(0, 120),
        quiz: data.quiz,
      };
      localStorage.setItem(quizId, JSON.stringify(quizRecord));

      const history = JSON.parse(localStorage.getItem("quiz_history") || "[]");
      history.unshift(quizId);
      localStorage.setItem("quiz_history", JSON.stringify(history));

      router.push(`/quiz?id=${quizId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold text-blueprint-dark mb-2">
          Turn your lecture notes into a quiz
        </h1>
        <p className="text-ink/70 mb-8">
          Paste your notes or upload a PDF. NotesToQuiz builds an instant quiz and
          tracks which topics you&apos;re weak on.
        </p>

        <div className="bg-white border-2 border-blueprint-dark/10 rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-mono font-semibold text-blueprint-dark mb-2">
            1. Upload a PDF (optional)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-ink/70 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:font-semibold file:bg-blueprint
              file:text-white hover:file:bg-blueprint-dark file:cursor-pointer cursor-pointer"
          />
          {fileName && (
            <p className="text-xs text-ink/50 mt-1">Loaded: {fileName}</p>
          )}

          <label className="block text-sm font-mono font-semibold text-blueprint-dark mt-6 mb-2">
            2. Or paste your notes
          </label>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={10}
            placeholder="Paste lecture notes, slide text, or a textbook chapter here..."
            className="w-full border border-ink/15 rounded-lg p-3 text-sm focus:outline-none
              focus:ring-2 focus:ring-blueprint resize-y"
          />

          {error && (
            <p className="text-bad text-sm mt-3 font-medium">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 w-full bg-accent hover:bg-orange-500 disabled:opacity-50
              text-white font-mono font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? "Generating quiz..." : "Generate Quiz"}
          </button>
        </div>
      </main>
    </div>
  );
}
