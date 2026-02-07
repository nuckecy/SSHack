# System Sidekick — Hackathon Implementation Plan

## Context

System Sidekick is a fully working WCAG 2.2 accessibility assistant Figma plugin. The team wants to evolve it into a **design system assistant** that recommends ShadCN components, explains why, and optionally places them on canvas. 
### Library Decision: Keep the Public Library

**Do NOT build a custom Figma component library.** Instead:
- Continue using the **Obra ShadCN UI Kit** as-is
- The `shadcn-components.json` metadata file (already started in `others/karly-demo/`) IS your custom layer — it maps component names to usage rules, variants, accessibility, anti-patterns
- This gives you 90% of the value at 5% of the effort

### Scope: 5 Steps, Not 10 Tasks

Focus the hackathon on the **conversation loop** (US-1, US-2, US-3). Cut component placement (US-4) unless you finish early.

---

## What Already Exists

| Asset | Location | Status |
|-------|----------|--------|
| Chat UI + multi-provider AI | `src/ui/` | Complete |
| WCAG knowledge base (84 SC) | `data/wcag-complete.json` | Complete |
| Hybrid search engine | `src/ui/knowledge/search.ts` | Complete |
| Prompt builder | `src/ui/knowledge/prompt-builder.ts` | Complete |
| ShadCN component metadata | `others/karly-demo/.../shadcn-components.json` | 12 components, rich metadata |
| Component keys (Figma) | `others/karly-demo/component-keys.txt` | 5 of 12 extracted |
| Placement prototype | `others/karly-demo/.../main.ts` | Working code (importComponentByKeyAsync) |
| Selection reading | `src/code.ts:36-53` | Already implemented |

---

## Implementation Steps

### Step 1: Add ShadCN Component Data to Main Plugin
**Files:** `data/shadcn-components.json` (new), `src/ui/knowledge/shadcn-data.ts` (new)

- Copy `others/karly-demo/system-sidekick-api/data/shadcn-components.json` into `data/shadcn-components.json`
- Create a TypeScript module to import and type it (same pattern as `wcag-data.ts`)
- Define `ShadCNComponent` interface matching the JSON schema

### Step 2: Build Design System Search
**File:** `src/ui/knowledge/component-search.ts` (new)

- Keyword search over component names, purposes, variant `when` descriptions, anti-patterns
- Shortcut map: `"button"` → Button, `"form"` → [Input, Select, Checkbox], `"modal"` → [Dialog, Alert Dialog], `"toggle"` → [Switch, Checkbox], etc.
- Return top 1-3 matching components with full metadata
- Direct name match: if user says "Button", return Button component directly

### Step 3: Extend Prompt Builder for Dual Knowledge
**File:** `src/ui/knowledge/prompt-builder.ts` (modify)

- Update `buildPrompt()` to also search ShadCN components
- Inject matched component metadata into system prompt alongside WCAG criteria
- Update system prompt from "WCAG expert" to "design system + accessibility expert"

**New system prompt:**
```
You are System Sidekick, a design system and accessibility expert embedded in Figma.
You help designers choose the right ShadCN component for their use case and apply WCAG 2.2 guidelines.

RULES:
- Recommend specific components by name and variant
- Explain WHY a component/variant is the right choice (reference system rules)
- Warn about anti-patterns when relevant
- Reference WCAG Success Criteria for accessibility guidance
- If no component fits, say so — don't invent components
- Structure responses as: Recommendation → Why → Accessibility notes
```

**Component context format injected into prompt:**
```
DESIGN SYSTEM CONTEXT:
Component: Button
Purpose: Triggers an action or event
Recommended variant: "default" — Primary action, main CTA
Anti-patterns: Don't use multiple default buttons in one section
Accessibility: 40px minimum touch target, Space/Enter to activate
```

### Step 4: Wire Selection Context into Chat
**Files:** `src/code.ts` (modify), `src/ui/components/ChatView.tsx` (modify)

- Main thread already reads selection (`code.ts:36-53`) — add `selectionchange` listener to push updates automatically (pattern from `others/karly-demo/.../main.ts:50-60`)
- Store selection context in ChatView state
- Append selection info to user query when sending to AI:
  `"[Context: Selected frame 'Login Form', 320x480px] What button should I use here?"`
- Graceful fallback: if nothing selected, just send the raw query

### Step 5: Update UI Copy + Suggestion Chips
**Files:** `src/ui/components/SuggestionChips.tsx`, `src/ui/App.tsx`

- Update suggestion chips from WCAG topics to design system queries:
  - "Which button variant?"
  - "Form components"
  - "Show me a dialog"
  - "Accessibility check"
  - "What component for...?"
- Update welcome message to reflect design system assistant role
- Update meta responses (hello, help) to describe design system capabilities

### Step 6 (STRETCH — only if Steps 1-5 complete): Component Placement
**Files:** `src/code.ts` (modify), `src/ui/components/MessageBubble.tsx` (modify)

- Add `PLACE_COMPONENT` message handler to `code.ts` (port from `others/karly-demo/.../main.ts:7-46`)
- Add "Place in Canvas" button to bot messages that recommend a specific component
- Limit to the 5 components with known Figma keys: Button, Alert, Alert Dialog, Radio Group, Select
- Position below current selection or at viewport center

---

## What Gets Cut

| Item | Why |
|------|-----|
| Custom Figma library | Public library + metadata JSON is sufficient |
| All 12 component keys | Only 5 are extracted; placement limited to those 5 |
| US-6a/6b (critique + violations) | P1, not hackathon scope |
| US-7/8/9 (learning, a11y depth, composition) | P2, future |
| Streaming responses | Not needed for demo |
| Backend proxy | BYOK is simpler and already works |

---

## Demo Flow (The Golden Path)

1. Open plugin → "Welcome to System Sidekick, your design system assistant"
2. Click chip: "Which button variant?" → AI recommends `default` variant, explains hierarchy rule, notes 40px touch target
3. Select a frame named "Delete Confirmation" → Ask "What component should I use?" → AI recommends Alert Dialog + destructive Button, explains why
4. Ask "What about accessibility?" → AI references WCAG SC with specific criteria
5. (Stretch) Click "Place in Canvas" → component instance appears below selection

---

## Verification

1. `npm run build` — must succeed with no errors
2. Load plugin in Figma Desktop (Plugins → Development → Import manifest)
3. Test without API key → should show keyword results for both WCAG and component queries
4. Test with API key → should get structured AI responses (Recommendation + Why + Accessibility)
5. Test selection context → select a frame, ask a question, verify context appears in AI response
6. (Stretch) Test component placement → click "Place" button, verify instance appears on canvas

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `data/shadcn-components.json` | New — copy from karly-demo |
| `src/ui/knowledge/shadcn-data.ts` | New — TypeScript types + import |
| `src/ui/knowledge/component-search.ts` | New — design system search |
| `src/ui/knowledge/prompt-builder.ts` | Modify — dual knowledge injection |
| `src/code.ts` | Modify — auto selection push + (stretch) placement handler |
| `src/ui/components/ChatView.tsx` | Modify — selection state + context injection |
| `src/ui/components/SuggestionChips.tsx` | Modify — new chip topics |
| `src/ui/App.tsx` | Modify — welcome copy + selection wiring |
| `src/ui/components/MessageBubble.tsx` | Modify (stretch) — "Place" button |

---

## Time Estimate by Step

| Step | Effort | Parallelizable? |
|------|--------|-----------------|
| Step 1: Add ShadCN data | ~30 min | Can pair with Step 2 |
| Step 2: Component search | ~45 min | Can pair with Step 1 |
| Step 3: Dual prompt builder | ~45 min | Depends on 1+2 |
| Step 4: Selection context | ~30 min | Independent |
| Step 5: UI copy updates | ~20 min | Independent |
| Step 6: Placement (stretch) | ~60 min | Depends on all above |
| **Total (Steps 1-5)** | **~3 hours** | |
| **Total (with stretch)** | **~4 hours** | |
