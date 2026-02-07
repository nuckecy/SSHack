import type { ConversationTurn } from "./types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function sendToGemini(
  userMessage: string,
  systemPrompt: string,
  history: ConversationTurn[],
  apiKey: string
): Promise<string> {
  // Build conversation contents from history, mapping "assistant" → "model" for Gemini
  const contents = [
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.text }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      topP: 0.9,
    },
  };

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API error: ${errorMessage}`);
  }

  const data = await response.json();

  const candidates = data?.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No response from Gemini");
  }

  const parts = candidates[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("Empty response from Gemini");
  }

  return parts.map((p: { text?: string }) => p.text || "").join("");
}

/**
 * Test connection by sending a simple prompt.
 * Returns true if successful, throws on failure.
 */
export async function testGeminiConnection(apiKey: string): Promise<boolean> {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: "Say OK" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 10,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
  }

  return true;
}
