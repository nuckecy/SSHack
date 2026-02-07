# Plan: Add shadcn-components.json + Inject Component Keys into Prompt

## Context

The system prompt (Section 6) tells the AI to respond with placement JSON using `componentKey`, but the AI has no actual keys to use. The user has extracted real Figma component keys from the Obra ShadCN UI Kit. We need to store them in a data file, load them, and inject the matched component's key into the prompt context so the AI can produce working placement responses.

## Files to Change

### 1. NEW: `data/shadcn-components.json`

Minimal JSON array with the 15 component keys:

```json
[
  { "id": "alert", "name": "Alert", "figmaKey": "4d087b2a45937db2a0dae72ef45cd5439e3d05d5" },
  { "id": "alert-dialog", "name": "Alert Dialog", "figmaKey": "5ec2ea8cc19e86eabbc97009dcfd09c278df5d15" },
  { "id": "badge", "name": "Badge", "figmaKey": "9f1d7f74487b9fb495d8ec983b56524a8c880d56" },
  { "id": "button", "name": "Button", "figmaKey": "96c2d89a4708a7d5b8f24ff7a1811cdac494f0c1" },
  { "id": "card", "name": "Card", "figmaKey": "0d0593d7566998757474f2332e175189fff62324" },
  { "id": "checkbox", "name": "Checkbox", "figmaKey": "a32542edf78409a815f0207db8f95c311e2df7a2" },
  { "id": "dialog", "name": "Dialog", "figmaKey": "2f06d4e1b267f63ebd8cd5036d28ed53054e1a0" },
  { "id": "hover-card", "name": "Hover Card", "figmaKey": "8b051d04c608d5def0db97ca6832051c11b24bb7" },
  { "id": "input", "name": "Input", "figmaKey": "cab7a702a3b694c3020e053f2fd56298cbede750" },
  { "id": "navigation-menu", "name": "Navigation Menu", "figmaKey": "9094a387713908f449b6827ac01deff4a4cddb24" },
  { "id": "radio", "name": "Radio", "figmaKey": "dcf0893d3b8f903343da59b64d370e98062012b7" },
  { "id": "radio-group", "name": "Radio Group", "figmaKey": "20be41c05b9404f9b6089a724ba1bb9a76f14ea3" },
  { "id": "select", "name": "Select", "figmaKey": "32b979d28da779733189397c84a5dc15c606c904" },
  { "id": "switch", "name": "Switch", "figmaKey": "aca9f69add49b84c30db9d138358601b33b4e744" },
  { "id": "tooltip", "name": "Tooltip", "figmaKey": "bcf0e4a897bd9c962d74ea5deab85ac3b2626afd" }
]
```

> **Note:** These figmaKeys are placeholders. Replace them with real keys extracted from your Figma file. See the key extraction instructions in the component keys reference.

### 2. NEW: `src/ui/knowledge/component-data.ts`

Build-time import + lookup map (mirrors `wcag-data.ts` pattern):

```ts
import rawData from "../../../data/shadcn-components.json";

interface ShadcnComponent {
  id: string;
  name: string;
  figmaKey: string;
}

export const componentData: ShadcnComponent[] = rawData as ShadcnComponent[];
export const componentByName: Map<string, ShadcnComponent> = new Map(
  componentData.map((c) => [c.name, c])
);
```

### 3. MODIFY: `src/ui/knowledge/prompt-builder.ts`

- Import `componentByName` from `./component-data`
- Update `findMatchedComponents()` to return full component objects (name + figmaKey) instead of just name strings
- In `buildPrompt()`, when components match, append a `COMPONENT CONTEXT` block to the prompt:

```
AVAILABLE COMPONENTS (use these exact figmaKeys for placement):
- Button (figmaKey: 96c2d89a4708a7d5b8f24ff7a1811cdac494f0c1)
- Alert Dialog (figmaKey: 5ec2ea8cc19e86eabbc97009dcfd09c278df5d15)
```

- Keep existing console.log for verification

### No other files change

`types.ts`, `ChatView.tsx`, `MessageBubble.tsx`, `code.ts` — all untouched.

## Verification

1. `npm run build` — no errors
2. In Figma DevTools console:
   - Query "button" → logs `[{name: "Button", figmaKey: "96c2..."}]`
   - Query "modal" → logs Dialog + Alert Dialog with keys
3. With an API key, ask "I need a button" then say "place it" → the AI should respond with correct placement JSON including the real figmaKey
