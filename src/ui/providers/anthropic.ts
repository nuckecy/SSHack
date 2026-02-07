import type { ConversationTurn } from "./types";

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

export async function sendToAnthropic(
  userMessage: string,
  systemPrompt: string,
  history: ConversationTurn[],
  apiKey: string
): Promise<string> {
  const messages = [
    ...history.map((turn) => ({
      role: turn.role as "user" | "assistant",
      content: turn.text,
    })),
    {
      role: "user" as const,
      content: userMessage,
    },
  ];

  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  };

  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Claude API error: ${errorMessage}`);
  }

  const data = await response.json();

  const content = data?.content;
  if (!content || content.length === 0) {
    throw new Error("Empty response from Claude");
  }

  return content
    .filter((block: { type: string }) => block.type === "text")
    .map((block: { text: string }) => block.text)
    .join("");
}

export async function testAnthropicConnection(apiKey: string): Promise<boolean> {
  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 10,
      messages: [{ role: "user", content: "Say OK" }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
  }

  return true;
}
