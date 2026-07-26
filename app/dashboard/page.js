"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Nav from "@/components/Nav";

export default function Dashboard() {
  const [topicStats, setTopicStats] = useState({});
  const [results, setResults] = useState([]);

  useEffect(() => {
    setTopicStats(JSON.parse(localStorage.getItem("topic_stats") || "{}"));
    setResults(JSON.parse(localStorage.getItem("quiz_results") || "[]"));
  }, []);

  const topicData = Object.entries(topicStats).map(([topic, s]) => ({
    topic,
    accuracy: Math.round((s.correct / s.total) * 100),
    total: s.total,
  }));

  const weakTopics = [...topicData]
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <h1 className="text-2xl font-bold text-blueprint-dark mb-6">
          Your Progress
        </h1>

        {topicData.length === 0 ? (
          <div className="bg-white border-2 border-blueprint-dark/10 rounded-xl p-8 text-center text-ink/60">
            No quiz data yet. <a href="/" className="text-blueprint underline">Take a quiz</a> to see your stats here.
          </div>
        ) : (
          <>
            {weakTopics.length > 0 && (
              <div className="bg-bad/10 border-2 border-bad rounded-xl p-5 mb-6">
                <p className="font-mono font-bold text-bad mb-2">⚠ Weak Topics — Focus Here</p>
                <ul className="text-sm space-y-1">
                  {weakTopics.map((t) => (
                    <li key={t.topic}>
                      {t.topic} — {t.accuracy}% accuracy ({t.total} questions)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white border-2 border-blueprint-dark/10 rounded-xl p-5 mb-6">
              <p className="font-mono font-semibold text-blueprint-dark mb-4">
                Accuracy by Topic
              </p>
              <ResponsiveContainer width="100%" height={Math.max(200, topicData.length * 50)}>
                <BarChart data={topicData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="topic" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                    {topicData.map((t, i) => (
                      <Cell key={i} fill={t.accuracy < 60 ? "#d64545" : "#2f9e5c"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border-2 border-blueprint-dark/10 rounded-xl p-5">
              <p className="font-mono font-semibold text-blueprint-dark mb-4">
                Quiz History
              </p>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b border-ink/10 pb-2"
                  >
                    <span className="text-ink/60">
                      {new Date(r.date).toLocaleString()}
                    </span>
                    <span className="font-mono font-semibold">
                      {r.score}/{r.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
