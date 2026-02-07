import type { ProviderId, ProviderConfig, ConversationTurn } from "./types";
import { sendToGemini, testGeminiConnection } from "./gemini";
import { sendToAnthropic, testAnthropicConnection } from "./anthropic";
import { sendToOpenAI, testOpenAIConnection } from "./openai";

export const PROVIDER_IDS: ProviderId[] = ["gemini", "anthropic", "openai"];

export const PROVIDER_CONFIGS: Record<ProviderId, ProviderConfig> = {
  gemini: {
    name: "Gemini",
    keyPlaceholder: "Enter Gemini API key...",
    helpUrl: "https://aistudio.google.com",
    helpLabel: "aistudio.google.com",
    privacyNote: "Your key is stored locally and only sent to Google's Gemini API.",
  },
  anthropic: {
    name: "Claude",
    keyPlaceholder: "Enter Anthropic API key...",
    helpUrl: "https://console.anthropic.com",
    helpLabel: "console.anthropic.com",
    privacyNote: "Your key is stored locally and only sent to Anthropic's API.",
  },
  openai: {
    name: "GPT",
    keyPlaceholder: "Enter OpenAI API key...",
    helpUrl: "https://platform.openai.com/api-keys",
    helpLabel: "platform.openai.com",
    privacyNote: "Your key is stored locally and only sent to OpenAI's API.",
  },
};

interface ProviderDispatch {
  sendMessage: (
    userMessage: string,
    systemPrompt: string,
    history: ConversationTurn[],
    apiKey: string
  ) => Promise<string>;
  testConnection: (apiKey: string) => Promise<boolean>;
}

export const PROVIDERS: Record<ProviderId, ProviderDispatch> = {
  gemini: {
    sendMessage: sendToGemini,
    testConnection: testGeminiConnection,
  },
  anthropic: {
    sendMessage: sendToAnthropic,
    testConnection: testAnthropicConnection,
  },
  openai: {
    sendMessage: sendToOpenAI,
    testConnection: testOpenAIConnection,
  },
};
