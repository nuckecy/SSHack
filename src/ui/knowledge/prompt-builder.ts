import type { WCAGCriterion } from "../providers/types";
import { searchWCAG } from "./search";

const SYSTEM_PROMPT_BASE = `You are System Sidekick, a WCAG 2.2 accessibility expert embedded in Figma.
You help designers understand and apply accessibility guidelines.

RULES:
- Reference specific WCAG Success Criteria by number (e.g., SC 1.4.3) and level (A/AA/AAA)
- Keep responses concise and practical for designers
- Mention specific values where relevant (contrast ratios, target sizes, timing, etc.)
- If unsure, say so rather than inventing criteria
- Use **bold** for emphasis and bullet points for lists
- Be direct, friendly, and helpful`;

/**
 * Formats a single SC into a context string for the AI prompt.
 */
function formatSCForContext(sc: WCAGCriterion): string {
  let text = `SC ${sc.ref_id} - ${sc.title} (Level ${sc.level})\n`;
  text += sc.description;

  if (sc.special_cases && sc.special_cases.length > 0) {
    text += "\nExceptions: ";
    text += sc.special_cases
      .map((e) => `${e.title}: ${e.description}`)
      .join("; ");
  }

  if (sc.notes && sc.notes.length > 0) {
    text += "\nNotes: ";
    text += sc.notes.map((n) => n.content).join("; ");
  }

  return text;
}

/**
 * Builds the full system prompt with relevant WCAG context for a given query.
 * Returns both the prompt and the matched criteria (for fallback display).
 */
export function buildPrompt(query: string): {
  systemPrompt: string;
  matchedCriteria: WCAGCriterion[];
} {
  const results = searchWCAG(query, 5);
  const matchedCriteria = results.map((r) => r.criterion);

  if (matchedCriteria.length === 0) {
    return {
      systemPrompt: SYSTEM_PROMPT_BASE,
      matchedCriteria: [],
    };
  }

  const contextBlock = matchedCriteria.map(formatSCForContext).join("\n\n");

  const systemPrompt = `${SYSTEM_PROMPT_BASE}

CONTEXT (relevant WCAG success criteria for this query):
${contextBlock}`;

  return { systemPrompt, matchedCriteria };
}
