export type ProviderId = "gemini" | "anthropic" | "openai";

export interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  /** Optional SC cards to display with this message */
  cards?: WCAGCriterion[];
  timestamp: number;
}

export interface WCAGCriterion {
  ref_id: string;
  title: string;
  description: string;
  url: string;
  level: "A" | "AA" | "AAA";
  special_cases?: SpecialCase[];
  notes?: Note[];
  references?: Reference[];
}

export interface SpecialCase {
  type: "exception" | "note";
  title: string;
  description: string;
}

export interface Note {
  content: string;
}

export interface Reference {
  title: string;
  url: string;
}

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

export interface ProviderConfig {
  name: string;
  keyPlaceholder: string;
  helpUrl: string;
  helpLabel: string;
  privacyNote: string;
}

export interface ProviderKeys {
  gemini: string;
  anthropic: string;
  openai: string;
}
