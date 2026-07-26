"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";

function QuizContent() {
  const params = useSearchParams();
  const router = useRouter();
  const quizId = params.get("id");

  const [quizRecord, setQuizRecord] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [saAnswers, setSaAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!quizId) return;
    const raw = localStorage.getItem(quizId);
    if (raw) setQuizRecord(JSON.parse(raw));
  }, [quizId]);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  if (!quizId) {
    return (
      <p className="p-8 text-center">
        No quiz selected.{" "}
        <a href="/" className="text-blueprint underline">Go generate one</a>.
      </p>
    );
  }

  if (!quizRecord) {
    return <p className="p-8 text-center">Loading quiz...</p>;
  }

  const { mcqs = [], shortAnswers = [] } = quizRecord.quiz || {};

  function formatTime(t) {
    const m = Math.floor(t / 60).toString().padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function handleSubmit() {
    setSubmitted(true);

    // Update weak-topic stats in localStorage
    const stats = JSON.parse(localStorage.getItem("topic_stats") || "{}");

    mcqs.forEach((q, i) => {
      const topic = q.topic || "General";
      stats[topic] = stats[topic] || { correct: 0, total: 0 };
      stats[topic].total += 1;
      if (mcqAnswers[i] === q.correctIndex) stats[topic].correct += 1;
    });

    localStorage.setItem("topic_stats", JSON.stringify(stats));

    // Record quiz result summary
    const correctCount = mcqs.filter((q, i) => mcqAnswers[i] === q.correctIndex).length;
    const results = JSON.parse(localStorage.getItem("quiz_results") || "[]");
    results.unshift({
      quizId,
      date: new Date().toISOString(),
      score: correctCount,
      total: mcqs.length,
      timeTaken: seconds,
    });
    localStorage.setItem("quiz_results", JSON.stringify(results));
  }

  const correctCount = mcqs.filter((q, i) => mcqAnswers[i] === q.correctIndex).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blueprint-dark">Quiz</h1>
          <span className="font-mono bg-blueprint-dark text-white px-3 py-1 rounded-lg text-sm">
            ⏱ {formatTime(seconds)}
          </span>
        </div>

        {submitted && (
          <div className="bg-good/10 border-2 border-good rounded-xl p-5 mb-8 text-center">
            <p className="text-lg font-bold text-good">
              Score: {correctCount} / {mcqs.length}
            </p>
            <p className="text-sm text-ink/60 mt-1">Time taken: {formatTime(seconds)}</p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm font-mono bg-blueprint text-white px-4 py-2 rounded-lg hover:bg-blueprint-dark"
              >
                View Weak Topics
              </button>
              <button
                onClick={() => router.push("/")}
                className="text-sm font-mono bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-500"
              >
                New Quiz
              </button>
            </div>
          </div>
        )}

        <section className="space-y-6">
          {mcqs.map((q, i) => {
            const userAns = mcqAnswers[i];
            const isCorrect = userAns === q.correctIndex;
            return (
              <div key={i} className="bg-white border-2 border-blueprint-dark/10 rounded-xl p-5">
                <p className="font-semibold mb-1">
                  Q{i + 1}. {q.question}
                </p>
                <p className="text-xs font-mono text-blueprint mb-3">{q.topic}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    let style = "border-ink/15 hover:border-blueprint";
                    if (submitted) {
                      if (oi === q.correctIndex) style = "border-good bg-good/10";
                      else if (oi === userAns) style = "border-bad bg-bad/10";
                    } else if (userAns === oi) {
                      style = "border-blueprint bg-blueprint/5";
                    }
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() =>
                          setMcqAnswers((prev) => ({ ...prev, [i]: oi }))
                        }
                        className={`w-full text-left border-2 rounded-lg px-4 py-2 text-sm transition-colors ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className={`text-xs mt-3 ${isCorrect ? "text-good" : "text-bad"}`}>
                    {isCorrect ? "Correct — " : "Incorrect — "} {q.explanation}
                  </p>
                )}
              </div>
            );
          })}

          {shortAnswers.map((q, i) => (
            <div key={`sa-${i}`} className="bg-white border-2 border-blueprint-dark/10 rounded-xl p-5">
              <p className="font-semibold mb-1">Short Answer {i + 1}. {q.question}</p>
              <p className="text-xs font-mono text-blueprint mb-3">{q.topic}</p>
              <textarea
                disabled={submitted}
                rows={3}
                value={saAnswers[i] || ""}
                onChange={(e) => setSaAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                placeholder="Type your answer..."
                className="w-full border border-ink/15 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint"
              />
              {submitted && (
                <div className="mt-3 text-sm bg-paper rounded-lg p-3">
                  <p className="font-semibold text-blueprint-dark">Model answer:</p>
                  <p className="text-ink/80">{q.modelAnswer}</p>
                  <p className="text-ink/60 text-xs mt-2">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {!submitted && (
          <button
            onClick={handleSubmit}
            className="mt-8 w-full bg-blueprint hover:bg-blueprint-dark text-white font-mono font-bold py-3 rounded-lg transition-colors"
          >
            Submit Quiz
          </button>
        )}
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
      <QuizContent />
    </Suspense>
  );
}
