# System Sidekick — Figma Plugin

## What This Is

System Sidekick is a conversational WCAG 2.2 accessibility assistant that runs inside Figma as a plugin. Designers ask accessibility questions in natural language and get specific, grounded answers with success criteria references, practical guidance, and reference links.

**Vision:** "What if your design system could answer back — in context, on the canvas?"

## MVP Scope (What to Build)

### Core Features

1. **Chat Interface** — Clean conversational UI inside the Figma plugin panel (380x560px). Designers type natural language questions about accessibility.

2. **WCAG 2.2 Knowledge Base** — 84 success criteria from WCAG 2.2 embedded as JSON. Includes ref_id, title, description, level (A/AA/AAA), special_cases, notes, and reference URLs.

3. **Hybrid Search** — Keyword search finds relevant success criteria first (instant), then injects them as context into the AI prompt. If AI is unavailable, keyword results display as structured cards.

4. **AI Integration (Gemini Flash)** — Google Gemini 2.0 Flash for conversational synthesis. BYOK (Bring Your Own Key). Users enter their API key in settings.

5. **Conversation History** — Maintains chat context within a session (last 6 turns sent to AI).

6. **Dark/Light Theme** — Detects Figma's theme and adapts automatically.

7. **Settings Panel** — API key management with save, test connection, and remove functionality.

### What Is NOT in MVP

- Canvas context awareness (reading selected layers)
- Component insertion from libraries
- Multi-provider AI (only Gemini for MVP)
- Streaming responses
- Design system knowledge (ShadCN, tokens, components)
- RAG pipeline or vector database
- Backend proxy or managed API keys
- Proactive suggestions or linting

## Architecture

### Two-Context Model (Figma Plugin Requirement)

```
┌─────────────────────────────────────────────────┐
│                  FIGMA PLUGIN                    │
│                                                  │
│  ┌──────────────────┐  postMessage  ┌──────────┐│
│  │   UI THREAD      │ ◄──────────► │  MAIN    ││
│  │   (iframe)       │              │  THREAD  ││
│  │                  │              │          ││
│  │  • React Chat UI │              │ • Figma  ││
│  │  • AI API calls  │              │   API    ││
│  │  • WCAG search   │              │ • Notify ││
│  │  • BYOK settings │              │ • Resize ││
│  └──────────────────┘              └──────────┘│
│           │                                     │
│           │ fetch()                             │
│           ▼                                     │
│  ┌──────────────────┐                           │
│  │  Gemini API      │                           │
│  └──────────────────┘                           │
└─────────────────────────────────────────────────┘
```

| Context | Has Access To | Cannot Access |
|---------|---------------|---------------|
| **Main Thread** (code.ts) | Figma API, `figma.clientStorage`, `figma.notify()` | DOM, network, UI rendering |
| **UI Thread** (iframe/React) | DOM, `fetch()`, `localStorage`, full browser APIs | Figma document, layers |

Communication is exclusively via `postMessage()`. Network calls (AI API) happen in the UI thread.

### Project Structure

```
system-sidekick/
├── CLAUDE.md              # This file
├── manifest.json          # Figma plugin manifest
├── package.json
├── tsconfig.json
├── vite.config.ts         # Builds code.ts + inlines ui into HTML
├── data/
│   └── wcag-complete.json # 84 WCAG 2.2 success criteria (pre-built)
├── src/
│   ├── code.ts            # Main thread (Figma API)
│   └── ui/
│       ├── index.html     # Entry HTML
│       ├── index.tsx       # React mount
│       ├── App.tsx         # Root component (chat view + settings)
│       ├── components/
│       │   ├── ChatView.tsx       # Message list + input + send
│       │   ├── MessageBubble.tsx  # Renders user/bot messages
│       │   ├── SCCard.tsx         # Success Criteria card display
│       │   ├── SettingsPanel.tsx  # API key management
│       │   ├── SuggestionChips.tsx # Welcome quick-start prompts
│       │   └── TypingIndicator.tsx # Loading animation
│       ├── providers/
│       │   ├── types.ts           # Shared interfaces
│       │   └── gemini.ts          # Gemini Flash provider
│       ├── knowledge/
│       │   ├── wcag-data.ts       # Imports and types for WCAG JSON
│       │   ├── search.ts          # Keyword search engine
│       │   └── prompt-builder.ts  # Assembles system prompt + context
│       └── styles/
│           └── global.css         # Plugin UI styles (light/dark theme)
└── dist/                  # Build output (git-ignored)
    ├── code.js
    └── index.html         # Single-file with inlined JS/CSS
```

## Build System

**Toolchain:** Vite + React + TypeScript

**Build command:** `npm run build`
- Compiles `src/code.ts` → `dist/code.js` (Figma main thread, no DOM/browser APIs)
- Compiles `src/ui/*` → `dist/index.html` (single inline HTML file, Figma requirement)

**Dev command:** `npm run dev`
- Watches and rebuilds on change

**Key Vite requirement:** Figma plugins require the UI to be a single HTML file with all JS/CSS inlined (no external scripts). Use `vite-plugin-singlefile` to achieve this.

**manifest.json points to:**
- `"main": "dist/code.js"`
- `"ui": "dist/index.html"`

## WCAG Data

**Source:** tenon-io/wcag-as-json (MIT License) + manual additions for WCAG 2.1/2.2 criteria.

**Location:** `data/wcag-complete.json`

**Schema per entry:**
```typescript
interface WCAGCriterion {
  ref_id: string;        // e.g., "1.4.3"
  title: string;         // e.g., "Contrast (Minimum)"
  description: string;   // Full SC description
  url: string;           // W3C URL
  level: "A" | "AA" | "AAA";
  special_cases?: Array<{
    type: "exception" | "note";
    title: string;
    description: string;
  }>;
  notes?: Array<{
    content: string;
  }>;
  references?: Array<{
    title: string;
    url: string;
  }>;
}
```

**Stats:** 84 success criteria (31 Level A, 24 Level AA, 29 Level AAA). Includes all of WCAG 2.0, 2.1, and 2.2. Obsolete SC 4.1.1 (Parsing) is removed.

**Import strategy:** Import the JSON at build time so it's bundled into the UI. Do NOT fetch it at runtime.

## Search Engine Specification

### Shortcut Mappings (High Priority)

These map common design queries directly to the most relevant success criteria. When the user's query matches a shortcut keyword, return these specific SCs first:

```typescript
const SHORTCUTS: Record<string, string[]> = {
  "contrast": ["1.4.3", "1.4.6", "1.4.11"],
  "color contrast": ["1.4.3", "1.4.6", "1.4.11"],
  "colour contrast": ["1.4.3", "1.4.6", "1.4.11"],
  "touch target": ["2.5.8", "2.5.5"],
  "target size": ["2.5.8", "2.5.5"],
  "tap target": ["2.5.8", "2.5.5"],
  "click target": ["2.5.8", "2.5.5"],
  "focus": ["2.4.7", "2.4.11", "2.4.13", "2.4.3"],
  "focus visible": ["2.4.7", "2.4.11", "2.4.13"],
  "focus indicator": ["2.4.7", "2.4.11", "2.4.13"],
  "keyboard": ["2.1.1", "2.1.2", "2.1.3", "2.4.7"],
  "alt text": ["1.1.1"],
  "alternative text": ["1.1.1"],
  "image description": ["1.1.1"],
  "heading": ["1.3.1", "2.4.6", "2.4.10"],
  "headings": ["1.3.1", "2.4.6", "2.4.10"],
  "form": ["1.3.5", "3.3.1", "3.3.2", "3.3.3", "3.3.4"],
  "label": ["1.3.1", "3.3.2", "2.5.3"],
  "error": ["3.3.1", "3.3.3", "3.3.4", "3.3.8"],
  "error message": ["3.3.1", "3.3.3"],
  "color": ["1.4.1", "1.4.3", "1.4.6", "1.4.11"],
  "animation": ["2.3.3", "2.2.2"],
  "motion": ["2.3.3", "2.2.2"],
  "reflow": ["1.4.10"],
  "responsive": ["1.4.10"],
  "zoom": ["1.4.4", "1.4.10"],
  "text size": ["1.4.4", "1.4.8"],
  "font size": ["1.4.4", "1.4.8"],
  "spacing": ["1.4.12"],
  "text spacing": ["1.4.12"],
  "link": ["2.4.4", "2.4.9"],
  "navigation": ["2.4.5", "3.2.3", "3.2.4"],
  "login": ["3.3.8", "3.3.9", "3.3.2", "3.3.1", "2.1.1"],
  "authentication": ["3.3.8", "3.3.9"],
  "drag": ["2.5.7"],
  "dragging": ["2.5.7"],
  "orientation": ["1.3.4"],
  "captions": ["1.2.2", "1.2.4"],
  "video": ["1.2.1", "1.2.2", "1.2.3", "1.2.5"],
  "audio": ["1.2.1", "1.2.2", "1.2.3", "1.4.2"],
};
```

### Token-Based Scoring (Fallback)

When no shortcut matches:
1. Tokenize the query (split on spaces, lowercase, remove stopwords)
2. Score each SC against query tokens:
   - `ref_id` exact match: +15 points
   - `title` contains token: +10 points
   - `description` contains token: +5 points
   - `notes` contains token: +3 points
3. Return top 5 results sorted by score

### Direct Reference Detection

If the user types a SC reference like "SC 1.4.3", "1.4.3", or "WCAG 1.4.3", return the exact match.

### Level Filtering

If the user asks "Level AA criteria" or "what are all AA requirements", filter and return all criteria at that level.

## Gemini Flash Integration

### API Configuration

```typescript
const GEMINI_CONFIG = {
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  model: "gemini-2.0-flash",
  temperature: 0.4,
  maxOutputTokens: 1024,
  topP: 0.9
};
```

API key is passed as query parameter: `?key=${apiKey}`

### System Prompt

```
You are System Sidekick, a WCAG 2.2 accessibility expert embedded in Figma.
You help designers understand and apply accessibility guidelines.

RULES:
- Reference specific WCAG Success Criteria by number (e.g., SC 1.4.3) and level (A/AA/AAA)
- Keep responses concise and practical for designers
- Mention specific values where relevant (contrast ratios, target sizes, timing, etc.)
- If unsure, say so rather than inventing criteria
- Use **bold** for emphasis and bullet points for lists
- Be direct, friendly, and helpful

CONTEXT (relevant WCAG success criteria for this query):
{injected_sc_context}
```

### Request Flow

1. User types query
2. Keyword search finds top 5 relevant SCs
3. Format SCs as context string: `"SC X.X.X - Title (Level X)\nDescription\nExceptions\nNotes"`
4. Include last 6 conversation turns
5. Send to Gemini with system prompt + context + user message
6. Parse response and render in chat
7. If Gemini fails or no API key: display keyword search results as SC cards

### Conversation History Format

```typescript
interface ConversationTurn {
  role: "user" | "model";
  text: string;
}
// Keep last 6 turns in memory, include in each request
```

### Error Handling

- No API key: Plugin works in keyword-only mode, show SC cards
- Invalid API key: Show error in settings, badge turns red
- Network failure: Show "Unable to reach AI. Here's what I found:" + keyword results
- Rate limit: Show "AI is temporarily unavailable" + keyword results

## UI Specification

### Plugin Dimensions

`figma.showUI(__html__, { width: 380, height: 560, themeColors: true })`

### Layout

```
┌────────────────────────────────┐
│ 🛡 System Sidekick  WCAG 2.2  │ ← Header (logo, title, badge, settings, clear)
│ ✓ AI                     ⚙ 🗑 │
├────────────────────────────────┤
│                                │
│  Welcome message               │ ← Messages area (scrollable)
│                                │
│  [Contrast] [Touch targets]    │ ← Suggestion chips
│  [Focus] [Forms] [Alt text]    │
│                                │
│  User: What about contrast?    │ ← User message (right-aligned, blue)
│                                │
│  Bot: SC 1.4.3 requires...     │ ← Bot message (left-aligned)
│  ┌──────────────────────────┐  │
│  │ SC 1.4.3 Contrast (Min)  │  │ ← SC Card (color-coded level badge)
│  │ Level AA                  │  │
│  │ Description...            │  │
│  │ 🔗 How to Meet | Under.. │  │
│  └──────────────────────────┘  │
│                                │
├────────────────────────────────┤
│ [Type a question...    ] [Send]│ ← Input area (auto-resize textarea)
└────────────────────────────────┘
```

### Theme Support

Use CSS variables that adapt to Figma's theme. Figma provides `--figma-color-bg`, `--figma-color-text`, etc. when `themeColors: true` is set. Fall back to `prefers-color-scheme` media query.

### SC Card Design

- Color-coded level badge: Level A = green, Level AA = blue, Level AAA = purple
- Truncated description (300 chars max with "..." overflow)
- Exception list (max 5 items, 120 chars each)
- Reference links: "How to Meet" and "Understanding" linking to W3C

### Welcome Message

Show on first load:
- Greeting explaining what the plugin does
- AI status indicator (connected or keyword-only mode)
- 5 suggestion chips: "Contrast requirements", "Touch target sizes", "Focus indicators", "Form accessibility", "Alt text rules"

### Meta Query Handling

Hardcoded responses for: "hello", "hi", "hey", "help", "what can you do"
Return a capability overview with example queries.

## API Key Management (BYOK)

- **Storage:** `localStorage.setItem('ss_gemini_key', key)` — persists locally, never sent anywhere except Gemini API
- **Settings UI:** Password input field, Save button, Test Connection button, Remove button
- **Test Connection:** Send `"Say OK"` to Gemini, validate response
- **AI Status Badge:** No key = "✕ AI" (gray), Key saved = "✓ AI" (green)
- Show first 8 chars + "..." when key is saved

## Manifest Configuration

```json
{
  "name": "System Sidekick",
  "id": "system-sidekick-prototype",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/index.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": [
      "https://generativelanguage.googleapis.com"
    ]
  }
}
```

**IMPORTANT:** `allowedDomains` entries MUST include the `https://` scheme prefix. Without it, Figma rejects the manifest.

## Response Formatting

Bot messages should parse basic markdown:
- `**bold**` → `<strong>`
- `*italic*` → `<em>`
- Bullet points (`- ` or `• `) → list items
- SC references in messages (e.g., "SC 1.4.3") should be visually distinct

## Technical Gotchas

1. **Figma requires single-file UI:** All JS/CSS must be inlined into one HTML file. Use `vite-plugin-singlefile`.
2. **Main thread has NO DOM access:** `code.ts` runs in a sandbox. No `document`, no `window`, no `fetch`. Only Figma API.
3. **UI thread has NO Figma API access:** All Figma operations must be requested via `postMessage` to the main thread.
4. **JSON import:** Import `wcag-complete.json` directly in TypeScript. Vite handles JSON imports natively.
5. **Font loading:** Not needed for MVP (we don't create text nodes).
6. **No WebSocket support in Figma iframe.** Use standard `fetch` for API calls.
7. **`allowedDomains` must include `https://` scheme** or Figma shows "Invalid value for allowedDomains" error.

## Commands Reference

```bash
npm install          # Install dependencies
npm run dev          # Watch mode (rebuilds on change)
npm run build        # Production build → dist/
```

To test in Figma:
1. Build: `npm run build`
2. Figma Desktop → Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from project root
4. Right-click canvas → Plugins → Development → System Sidekick

## Data Attribution

- WCAG data sourced from tenon-io/wcag-as-json (MIT License)
- Success criteria content: Web Content Accessibility Guidelines (WCAG) 2.2, W3C Recommendation. Copyright © 2017-2023 W3C.
