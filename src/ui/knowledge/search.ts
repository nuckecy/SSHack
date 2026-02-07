import type { WCAGCriterion } from "../providers/types";
import { wcagData, wcagByRefId } from "./wcag-data";

// ─── Shortcut Mappings ───────────────────────────────────────────────
// Maps common design queries directly to the most relevant SCs.

const SHORTCUTS: Record<string, string[]> = {
  contrast: ["1.4.3", "1.4.6", "1.4.11"],
  "color contrast": ["1.4.3", "1.4.6", "1.4.11"],
  "colour contrast": ["1.4.3", "1.4.6", "1.4.11"],
  "touch target": ["2.5.8", "2.5.5"],
  "target size": ["2.5.8", "2.5.5"],
  "tap target": ["2.5.8", "2.5.5"],
  "click target": ["2.5.8", "2.5.5"],
  focus: ["2.4.7", "2.4.11", "2.4.13", "2.4.3"],
  "focus visible": ["2.4.7", "2.4.11", "2.4.13"],
  "focus indicator": ["2.4.7", "2.4.11", "2.4.13"],
  keyboard: ["2.1.1", "2.1.2", "2.1.3", "2.4.7"],
  "alt text": ["1.1.1"],
  "alternative text": ["1.1.1"],
  "image description": ["1.1.1"],
  heading: ["1.3.1", "2.4.6", "2.4.10"],
  headings: ["1.3.1", "2.4.6", "2.4.10"],
  form: ["1.3.5", "3.3.1", "3.3.2", "3.3.3", "3.3.4"],
  label: ["1.3.1", "3.3.2", "2.5.3"],
  error: ["3.3.1", "3.3.3", "3.3.4", "3.3.8"],
  "error message": ["3.3.1", "3.3.3"],
  color: ["1.4.1", "1.4.3", "1.4.6", "1.4.11"],
  animation: ["2.3.3", "2.2.2"],
  motion: ["2.3.3", "2.2.2"],
  reflow: ["1.4.10"],
  responsive: ["1.4.10"],
  zoom: ["1.4.4", "1.4.10"],
  "text size": ["1.4.4", "1.4.8"],
  "font size": ["1.4.4", "1.4.8"],
  spacing: ["1.4.12"],
  "text spacing": ["1.4.12"],
  link: ["2.4.4", "2.4.9"],
  navigation: ["2.4.5", "3.2.3", "3.2.4"],
  login: ["3.3.8", "3.3.9", "3.3.2", "3.3.1", "2.1.1"],
  authentication: ["3.3.8", "3.3.9"],
  drag: ["2.5.7"],
  dragging: ["2.5.7"],
  orientation: ["1.3.4"],
  captions: ["1.2.2", "1.2.4"],
  video: ["1.2.1", "1.2.2", "1.2.3", "1.2.5"],
  audio: ["1.2.1", "1.2.2", "1.2.3", "1.4.2"],
};

// ─── Stopwords ───────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can",
  "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "about", "between", "through", "during", "before",
  "after", "above", "below", "and", "but", "or", "nor", "not",
  "so", "yet", "both", "either", "neither", "each", "every",
  "all", "any", "few", "more", "most", "other", "some", "such",
  "no", "only", "own", "same", "than", "too", "very", "just",
  "because", "if", "when", "where", "how", "what", "which",
  "who", "whom", "this", "that", "these", "those", "i", "me",
  "my", "we", "our", "you", "your", "it", "its", "they", "them",
  "their", "he", "she", "him", "her", "his",
  "tell", "explain", "describe", "show", "give", "need",
  "want", "know", "think", "help", "please", "thanks",
  "wcag", "accessibility", "requirement", "requirements",
  "guideline", "guidelines", "criterion", "criteria",
  "standard", "standards", "rule", "rules",
]);

// ─── Tokenizer ───────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s.-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// ─── Search Function ─────────────────────────────────────────────────

export interface SearchResult {
  criterion: WCAGCriterion;
  score: number;
}

export function searchWCAG(query: string, maxResults = 5): SearchResult[] {
  const q = query.trim().toLowerCase();

  // 1. Direct SC reference detection (e.g., "SC 1.4.3", "1.4.3", "WCAG 1.4.3")
  const scMatch = q.match(/(?:sc\s*|wcag\s*)?(\d+\.\d+\.\d+)/i);
  if (scMatch) {
    const refId = scMatch[1];
    const sc = wcagByRefId.get(refId);
    if (sc) {
      return [{ criterion: sc, score: 100 }];
    }
  }

  // 2. Level filtering (e.g., "Level AA criteria", "all AAA")
  const levelMatch = q.match(/\blevel\s+(a{1,3})\b/i) || q.match(/\b(aaa|aa|a)\s+(?:criteria|requirements|level)\b/i);
  if (levelMatch) {
    const level = levelMatch[1].toUpperCase() as "A" | "AA" | "AAA";
    return wcagData
      .filter((sc) => sc.level === level)
      .map((sc) => ({ criterion: sc, score: 50 }));
  }

  // 3. Shortcut matching
  // Check multi-word shortcuts first (longer = more specific)
  const sortedShortcuts = Object.keys(SHORTCUTS).sort(
    (a, b) => b.length - a.length
  );
  for (const shortcut of sortedShortcuts) {
    if (q.includes(shortcut)) {
      const refIds = SHORTCUTS[shortcut];
      const results: SearchResult[] = [];
      for (const refId of refIds) {
        const sc = wcagByRefId.get(refId);
        if (sc) {
          results.push({ criterion: sc, score: 80 });
        }
      }
      if (results.length > 0) {
        return results.slice(0, maxResults);
      }
    }
  }

  // 4. Token-based scoring (fallback)
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored: SearchResult[] = wcagData.map((sc) => {
    let score = 0;
    const titleLower = sc.title.toLowerCase();
    const descLower = sc.description.toLowerCase();
    const notesText = (sc.notes || [])
      .map((n) => n.content)
      .join(" ")
      .toLowerCase();

    for (const token of tokens) {
      // Exact ref_id match
      if (sc.ref_id === token) score += 15;
      // Title match (highest weight)
      if (titleLower.includes(token)) score += 10;
      // Description match
      if (descLower.includes(token)) score += 5;
      // Notes match
      if (notesText.includes(token)) score += 3;
    }

    return { criterion: sc, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
