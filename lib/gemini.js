const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are a quiz generator for engineering students.
Given lecture notes, generate exactly 5 multiple-choice questions and 2 short-answer questions
that test conceptual understanding, not just memorization.

For each multiple-choice question include: the question text, 4 options, the index (0-3) of the
correct option, a short explanation, and a "topic" tag (a short 2-4 word label for the specific
subtopic it covers, e.g. "Thermodynamics - Entropy").

For each short-answer question include: the question text, a model answer, a short explanation,
and a "topic" tag.

Keep questions relevant to engineering coursework (formulas, applications, problem-solving)
rather than trivial recall where possible.

Return ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "mcqs": [
    { "question": "string", "options": ["a","b","c","d"], "correctIndex": 0, "explanation": "string", "topic": "string" }
  ],
  "shortAnswers": [
    { "question": "string", "modelAnswer": "string", "explanation": "string", "topic": "string" }
  ]
}`;

export async function generateQuizFromNotes(notesText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nLECTURE NOTES:\n"""\n${notesText.slice(0, 15000)}\n"""`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no content");
  }

  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
