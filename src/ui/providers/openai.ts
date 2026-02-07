import type { ConversationTurn } from "./types";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";

export async function sendToOpenAI(
  userMessage: string,
  systemPrompt: string,
  history: ConversationTurn[],
  apiKey: string
): Promise<string> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((turn) => ({
      role: turn.role as "user" | "assistant",
      content: turn.text,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const body = {
    model: OPENAI_MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.4,
    top_p: 0.9,
  };

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData?.error?.message || `HTTP ${response.status}`;
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }

  const data = await response.json();

  const choice = data?.choices?.[0];
  if (!choice || !choice.message?.content) {
    throw new Error("Empty response from GPT");
  }

  return choice.message.content;
}

export async function testOpenAIConnection(apiKey: string): Promise<boolean> {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: "Say OK" }],
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
  }

  return true;
}
