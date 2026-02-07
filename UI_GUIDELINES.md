# UI Guidelines: Carbon Design System Theme with Teal Accent

This document specifies every visual change required to overhaul System Sidekick's UI from its current generic styling to IBM's Carbon Design System language, using **Teal (#00897B)** as the primary accent color. No blue anywhere in the UI.

This is a **purely visual** overhaul. All existing functionality (chat, WCAG search, multi-provider AI, settings, keyboard shortcuts) must be preserved exactly as-is.

---

## Table of Contents

1. [Design Foundations](#1-design-foundations)
2. [Files to Modify](#2-files-to-modify)
3. [Color Tokens (global.css)](#3-color-tokens)
4. [Typography](#4-typography)
5. [Spacing System](#5-spacing-system)
6. [Header Redesign](#6-header-redesign)
7. [Chat Bubbles](#7-chat-bubbles)
8. [SC Cards](#8-sc-cards)
9. [Welcome State & Suggestion Chips](#9-welcome-state--suggestion-chips)
10. [Input Area](#10-input-area)
11. [Settings Panel](#11-settings-panel)
12. [Typing Indicator](#12-typing-indicator)
13. [Side Panel](#13-side-panel)
14. [Icon System](#14-icon-system)
15. [CSS Variable Migration Map](#15-css-variable-migration-map)
16. [Dark Mode Verification](#16-dark-mode-verification)
17. [Build & Verification Checklist](#17-build--verification-checklist)

---

## 1. Design Foundations

### Carbon Design Principles Applied

- **Flat, structured surfaces** — No drop shadows, no gradients. Use borders and background layers for hierarchy.
- **Sharp corners on tiles** — Cards/tiles use `border-radius: 0`. Only pills (tags, chips) and the send button get rounded corners.
- **Bottom-border inputs** — Text fields have only a bottom border, not a full box border.
- **8px spacing grid** — All spacing values are multiples of 4/8: `4, 8, 12, 16, 24, 32, 48`.
- **Teal accent replaces all blue** — Every instance of blue (`#0d6efd`, `#4dabf7`, `#4A9EFF`, `#cfe2ff`, etc.) becomes a teal variant.
- **Left accent bars** — Bot messages get a 3px teal left border as the signature visual element.

---

## 2. Files to Modify

| File | What Changes |
|------|-------------|
| `src/ui/styles/global.css` | Complete CSS variable replacement, all component styles |
| `src/ui/components/Icon.tsx` | Replace with stroke-based SVGs, add new icons, rename to keep filename |
| `src/ui/components/MessageBubble.tsx` | Add SC reference inline styling in `formatText()`, add "Sidekick" label |
| `src/ui/components/SCCard.tsx` | Update level badge colors (AA = teal not blue), replace emoji links with SVG icons |
| `src/ui/components/TypingIndicator.tsx` | Apply bot message styling (teal left bar), slow down animation |
| `src/ui/components/SuggestionChips.tsx` | No code changes needed (styling is CSS-only) |
| `src/ui/components/SettingsPanel.tsx` | No code changes needed (styling is CSS-only) |
| `src/ui/components/ChatView.tsx` | No code changes needed |
| `src/ui/App.tsx` | Update AI badge text (use unicode checkmark characters already in place) |
| `src/ui/index.html` | Add IBM Plex Sans font import in `<head>` |
| `manifest.json` | No changes needed |

---

## 3. Color Tokens

### Light Theme (`:root`)

Replace the entire `:root` block in `global.css` with these Carbon-inspired tokens:

```css
:root {
  /* Background layers */
  --cds-background:           #f4f4f4;    /* Gray 10 — page background */
  --cds-layer-01:             #ffffff;    /* White — cards, inputs, bubbles */
  --cds-layer-02:             #f4f4f4;    /* Gray 10 — nested containers */
  --cds-layer-accent:         #e0e0e0;    /* Gray 30 — elevated elements */

  /* Text */
  --cds-text-primary:         #161616;    /* Gray 100 */
  --cds-text-secondary:       #525252;    /* Gray 70 */
  --cds-text-placeholder:     #a8a8a8;    /* Gray 50 */
  --cds-text-on-color:        #ffffff;    /* White — text on teal backgrounds */

  /* Borders */
  --cds-border-subtle:        #e0e0e0;    /* Gray 30 */
  --cds-border-strong:        #8d8d8d;    /* Gray 50 */

  /* Interactive (Teal) */
  --cds-interactive:          #00897B;    /* Teal 600 — primary actions, links */
  --cds-interactive-hover:    #00796B;    /* Teal 700 — hover state */
  --cds-interactive-active:   #00695C;    /* Teal 800 — pressed state */

  /* Support */
  --cds-support-error:        #da1e28;    /* Red 60 */
  --cds-support-success:      #198038;    /* Green 60 */
  --cds-support-warning:      #f1c21b;    /* Yellow 30 */
  --cds-support-info:         #00897B;    /* Teal (replaces blue info) */

  /* Highlight & Focus */
  --cds-highlight:            #e0f2f1;    /* Teal tint at ~10% */
  --cds-overlay:              rgba(22, 22, 22, 0.5);
  --cds-focus:                #00897B;    /* Teal focus ring */

  /* Icons */
  --cds-icon-primary:         #161616;    /* Gray 100 */
  --cds-icon-secondary:       #525252;    /* Gray 70 */

  /* Level badges */
  --cds-level-a:              #198038;
  --cds-level-a-bg:           rgba(25, 128, 56, 0.1);
  --cds-level-aa:             #00897B;    /* Teal — NOT blue */
  --cds-level-aa-bg:          #e0f2f1;
  --cds-level-aaa:            #8A3FFC;
  --cds-level-aaa-bg:         rgba(138, 63, 252, 0.1);

  /* Carbon radius tokens */
  --cds-radius-none:          0;
  --cds-radius-sm:            4px;
  --cds-radius-pill:          24px;

  /* Typography */
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.43;          /* 20px at 14px */
  letter-spacing: 0.16px;
  color: var(--cds-text-primary);
  background: var(--cds-background);
}
```

### Dark Theme (`@media (prefers-color-scheme: dark)`)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --cds-background:           #161616;    /* Gray 100 */
    --cds-layer-01:             #262626;    /* Gray 90 */
    --cds-layer-02:             #393939;    /* Gray 80 */
    --cds-layer-accent:         #525252;    /* Gray 70 */

    --cds-text-primary:         #f4f4f4;    /* Gray 10 */
    --cds-text-secondary:       #c6c6c6;    /* Gray 30 */
    --cds-text-placeholder:     #6f6f6f;    /* Gray 60 */
    --cds-text-on-color:        #ffffff;

    --cds-border-subtle:        #393939;    /* Gray 80 */
    --cds-border-strong:        #6f6f6f;    /* Gray 60 */

    --cds-interactive:          #4DB6AC;    /* Teal 300 — brighter for dark */
    --cds-interactive-hover:    #80CBC4;    /* Teal 200 */
    --cds-interactive-active:   #009688;    /* Teal 500 */

    --cds-highlight:            rgba(77, 182, 172, 0.1);
    --cds-focus:                #4DB6AC;

    --cds-icon-primary:         #f4f4f4;
    --cds-icon-secondary:       #c6c6c6;

    --cds-level-a-bg:           rgba(25, 128, 56, 0.15);
    --cds-level-aa-bg:          rgba(77, 182, 172, 0.15);
    --cds-level-aaa-bg:         rgba(138, 63, 252, 0.15);
  }
}
```

### Figma Theme Override

```css
.figma-dark {
  --cds-background:     var(--figma-color-bg, #161616);
  --cds-layer-01:       var(--figma-color-bg-secondary, #262626);
  --cds-text-primary:   var(--figma-color-text, #f4f4f4);
  --cds-text-secondary: var(--figma-color-text-secondary, #c6c6c6);
  --cds-border-subtle:  var(--figma-color-border, #393939);
}
```

---

## 4. Typography

### Font Import

Add to `src/ui/index.html` inside `<head>`, **before** the closing `</head>` tag:

```html
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap');
</style>
```

**Fallback:** If Figma blocks the font import (network restriction), the system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) takes over automatically. No build breakage.

### Type Scale

| Usage | Size | Line-Height | Weight | Letter-Spacing | CSS Class/Context |
|-------|------|-------------|--------|----------------|-------------------|
| Body text | 14px | 20px (1.43) | 400 | 0.16px | Default on `:root` |
| Label / Helper | 12px | 16px (1.33) | 400 | 0.32px | `.settings-label`, `.settings-help`, `.side-panel-label` |
| Heading 01 | 14px | 18px (1.29) | 600 | 0.16px | `.header-title`, card titles |
| Heading 02 | 16px | 22px (1.375) | 600 | 0.16px | Welcome heading |
| Tag/Badge text | 12px | 16px | 400 or 600 | 0.32px | `.header-badge`, `.ai-badge`, level badges |
| Chip text | 12px | 16px | 400 | 0.16px | `.chip` |
| Input text | 14px | 20px | 400 | 0.16px | `.chat-input`, `.key-input` |

---

## 5. Spacing System

All spacing uses Carbon's 8px grid (multiples of 4 and 8).

| Token | Value | Usage |
|-------|-------|-------|
| `$spacing-01` | 2px | Minimal, e.g. tag internal padding vertical |
| `$spacing-02` | 4px | Icon button gaps, tight spacing |
| `$spacing-03` | 8px | Related item gaps, chip gaps |
| `$spacing-04` | 12px | Compact component padding, panel padding |
| `$spacing-05` | 16px | Standard component padding, header padding |
| `$spacing-06` | 24px | Section gaps |
| `$spacing-07` | 32px | Large section separation |

### Key Spacing Changes

- Header padding: `0 16px` (was `8px 12px`)
- Header height: `48px` (explicit, was auto)
- Message gap (same sender): `4px`
- Message gap (different sender): `16px` (was uniform `8px`)
- Card padding: `16px` (was `10px`)
- Input area padding: `12px 16px` (was `8px 12px`)
- Side panel content padding: `16px` (was `12px`)
- Settings section gaps: `24px` (was `16px`)

---

## 6. Header Redesign

### Current State
- Background: `var(--bg-primary)` (white/dark)
- Padding: `8px 12px`
- Uses Material Design filled SVG icons
- AI badge says "✓ AI" or "✕ AI"

### Target State

```css
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  border-bottom: 1px solid var(--cds-border-subtle);
  background: var(--cds-layer-01);
  flex-shrink: 0;
}
```

**Left side elements:**

1. **Shield icon** — 20x20px, filled with `var(--cds-interactive)` (teal). Replace the current Material Design shield path with a custom simpler shield:
   - A minimal shield outline with a checkmark inside, or a shield silhouette
   - `viewBox="0 0 20 20"`, `fill` with teal

2. **"System Sidekick"** text:
   ```css
   .header-title {
     font-weight: 600;
     font-size: 14px;
     line-height: 18px;
     letter-spacing: 0.16px;
     color: var(--cds-text-primary);
   }
   ```

3. **"WCAG 2.2" tag** — Carbon tag style:
   ```css
   .header-badge {
     font-size: 12px;
     font-weight: 400;
     padding: 2px 8px;
     border-radius: 24px;      /* pill shape */
     background: var(--cds-highlight);
     color: var(--cds-interactive);
     border: none;
     letter-spacing: 0.32px;
     line-height: 16px;
   }
   ```

4. **AI status tag** — Same pill shape:
   ```css
   .ai-badge {
     font-size: 12px;
     font-weight: 400;
     padding: 2px 8px;
     border-radius: 24px;
     letter-spacing: 0.32px;
     line-height: 16px;
   }

   .ai-badge.active {
     background: rgba(25, 128, 56, 0.1);
     color: #198038;            /* Green — "connected" */
   }

   .ai-badge.inactive {
     background: var(--cds-layer-02);
     color: var(--cds-text-placeholder);
   }
   ```

**Right side elements:**

Icon buttons:
```css
.icon-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  color: var(--cds-icon-secondary);
  transition: background 150ms ease, color 150ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.icon-btn:hover {
  background: var(--cds-layer-02);
  color: var(--cds-icon-primary);
}
```

Icons inside buttons: 16x16px SVGs with `stroke: currentColor`, `stroke-width: 1.5`, `fill: none`.

Gap between icon buttons: `4px`.

---

## 7. Chat Bubbles

### Bot Messages

The defining visual signature: **teal left accent bar**.

```css
.message-bot .message-text {
  background: var(--cds-layer-01);
  border: 1px solid var(--cds-border-subtle);
  border-left: 3px solid var(--cds-interactive);   /* Teal accent bar */
  border-radius: 0 4px 4px 0;                      /* Sharp left, soft right */
  padding: 12px 16px;
  font-size: 14px;
  line-height: 20px;
  color: var(--cds-text-primary);
}
```

**Bot label:** Show "Sidekick" above the message text (requires `MessageBubble.tsx` change):
```css
.bot-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--cds-interactive);
  margin-bottom: 4px;
  line-height: 16px;
  letter-spacing: 0.32px;
}
```

Implementation in `MessageBubble.tsx`: Add a `<span className="bot-label">Sidekick</span>` inside `.message-bot` before `.message-text`. For message grouping (same sender consecutive = no label), this would require tracking the previous message's role, which adds complexity. **Simplification for MVP:** always show the label on bot messages, or only show it on the first bot message overall. A simple approach: add the label statically to all bot messages.

### User Messages

```css
.message-user .message-text {
  background: var(--cds-interactive);
  color: var(--cds-text-on-color);
  border-radius: 4px 0 0 4px;                      /* Soft left, sharp right */
  border-right: 3px solid var(--cds-interactive-active);  /* Darker teal accent */
  padding: 12px 16px;
  font-size: 14px;
  line-height: 20px;
}
```

Remove any existing `border`, `box-shadow`, or other styling on user messages.

### Message Spacing

```css
.message {
  max-width: 92%;
  animation: fadeIn 200ms ease-out;
}

/* Different sender gap: use the existing 8px gap but add a CSS rule for larger gaps */
.message + .message {
  margin-top: 4px;          /* Same sender consecutive */
}

.message-user + .message-bot,
.message-bot + .message-user {
  margin-top: 16px;         /* Different sender */
}
```

**Note:** The messages area uses `gap: 8px` currently. Replace with `gap: 0` and use margin-top on `.message` elements as shown above for finer control.

### Bot Message Text Formatting

Update `formatText()` in `MessageBubble.tsx` to style SC references as inline tags:

```typescript
// After bold/italic replacement, before line break replacement:
// SC references: "SC 1.4.3" or "SC 2.5.8" → inline Carbon tag
.replace(
  /SC\s+(\d+\.\d+\.\d+)/g,
  '<span class="sc-inline-ref">SC $1</span>'
);
```

CSS for inline SC references:
```css
.sc-inline-ref {
  display: inline;
  background: var(--cds-highlight);
  color: var(--cds-interactive);
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.32px;
  white-space: nowrap;
}
```

**Bullet points** — Use a teal dot instead of the `•` character:
```css
.message-text .bullet {
  padding-left: 16px;
  margin: 2px 0;
  position: relative;
}

.message-text .bullet::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cds-interactive);
}
```

Update `formatText()` to NOT include the `•` character, just the text:
```typescript
// Change from:
'<div class="bullet">• $1</div>'
// To:
'<div class="bullet">$1</div>'
```

For user messages (white text on teal), the bullet dot should be white:
```css
.message-user .message-text .bullet::before {
  background: var(--cds-text-on-color);
}
```

---

## 8. SC Cards

### Carbon "Tile" Pattern

```css
.sc-card {
  border: 1px solid var(--cds-border-subtle);
  border-radius: 0;                                 /* Carbon sharp corners */
  padding: 16px;
  background: var(--cds-layer-01);
  box-shadow: none;                                  /* Remove shadow */
}
```

### Card Header

```css
.sc-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.sc-ref-id {
  font-weight: 600;
  font-size: 12px;
  color: var(--cds-text-primary);
  letter-spacing: 0.32px;
}

.sc-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  flex: 1;
  color: var(--cds-text-primary);
}
```

### Level Badges (Carbon Tag Style)

```css
.sc-level {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 24px;
  letter-spacing: 0.32px;
  line-height: 16px;
}

.level-a {
  background: var(--cds-level-a-bg);     /* rgba(25, 128, 56, 0.1) */
  color: var(--cds-level-a);             /* #198038 */
}

.level-aa {
  background: var(--cds-level-aa-bg);    /* #e0f2f1 — teal tint */
  color: var(--cds-level-aa);            /* #00897B — TEAL, not blue */
}

.level-aaa {
  background: var(--cds-level-aaa-bg);   /* rgba(138, 63, 252, 0.1) */
  color: var(--cds-level-aaa);           /* #8A3FFC */
}
```

### Description

```css
.sc-description {
  font-size: 14px;
  line-height: 20px;
  color: var(--cds-text-secondary);
  margin-bottom: 12px;
}

.expand-btn {
  background: none;
  border: none;
  color: var(--cds-interactive);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  margin-left: 4px;
  text-decoration: none;
}

.expand-btn:hover {
  text-decoration: underline;
}
```

### Reference Links

Separated by a top border. Replace emoji prefixes with small inline SVG external-link icons.

```css
.sc-links {
  display: flex;
  gap: 16px;
  font-size: 12px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--cds-border-subtle);
}

.sc-links a {
  color: var(--cds-interactive);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sc-links a:hover {
  text-decoration: underline;
}
```

**SCCard.tsx change:** Replace emoji link text:
```tsx
// Change from:
🔗 How to Meet
📖 Understanding

// Change to (using inline SVG):
<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
  <path d="M12 8.667v4A1.333 1.333 0 0110.667 14H3.333A1.333 1.333 0 012 12.667V5.333A1.333 1.333 0 013.333 4h4M10 2h4v4M6.667 9.333L14 2" />
</svg>
How to Meet
```

Or define an `ExternalLink` icon in `Icon.tsx` and use `<Icon name="external_link" size={12} />`.

---

## 9. Welcome State & Suggestion Chips

### Welcome Message

The welcome message in the side panel should feel like a bot message with the teal accent:

```css
.side-panel-welcome {
  background: var(--cds-layer-01);
  border: 1px solid var(--cds-border-subtle);
  border-left: 3px solid var(--cds-interactive);
  border-radius: 0 4px 4px 0;
  padding: 12px 16px;
}

.side-panel-welcome strong {
  display: block;
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--cds-text-primary);
}

.side-panel-welcome p {
  font-size: 14px;
  line-height: 20px;
  color: var(--cds-text-secondary);
}
```

### "Try asking:" Label

```css
.side-panel-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--cds-text-secondary);
  letter-spacing: 0.32px;
  text-transform: uppercase;
  line-height: 16px;
}
```

### Suggestion Chips

Carbon interactive tag style:

```css
.chip {
  padding: 6px 12px;
  border: 1px solid var(--cds-border-subtle);
  border-radius: 24px;                              /* pill shape */
  background: var(--cds-layer-01);
  color: var(--cds-text-primary);
  font-size: 12px;
  line-height: 16px;
  cursor: pointer;
  transition: all 150ms ease;
}

.chip:hover {
  background: var(--cds-highlight);
  border-color: var(--cds-interactive);
  color: var(--cds-interactive);
}

.chip:active {
  background: var(--cds-interactive);
  color: var(--cds-text-on-color);
  border-color: var(--cds-interactive);
}
```

---

## 10. Input Area

### Carbon-style Bottom-Border Input

```css
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--cds-border-subtle);
  background: var(--cds-layer-01);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid var(--cds-border-strong);  /* Carbon bottom-border-only */
  border-radius: 0;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.43;
  resize: none;
  background: var(--cds-layer-02);
  color: var(--cds-text-primary);
  outline: none;
  transition: border-color 150ms ease;
  min-height: 56px;
  overflow: hidden;
  letter-spacing: 0.16px;
}

.chat-input:focus {
  border-bottom: 2px solid var(--cds-interactive);     /* Teal focus — 2px */
  padding-bottom: 9px;                                  /* Compensate for thicker border */
}

.chat-input::placeholder {
  color: var(--cds-text-placeholder);
}
```

### Send Button

```css
.send-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--cds-interactive);
  color: var(--cds-text-on-color);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 150ms ease, opacity 150ms ease;
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background: var(--cds-interactive-hover);
}
```

The `↑` character is acceptable but ideally replace with a small SVG arrow icon (see Icon System section).

---

## 11. Settings Panel

### Carbon Form Patterns

```css
.settings-panel {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.settings-header h3 {
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  color: var(--cds-text-primary);
}

.settings-section {
  margin-bottom: 24px;
}

.settings-label {
  display: block;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.32px;
  text-transform: uppercase;
  color: var(--cds-text-secondary);
  margin-bottom: 8px;
}

.settings-help {
  font-size: 12px;
  line-height: 16px;
  color: var(--cds-text-secondary);
  margin-bottom: 8px;
}
```

### Text Input (Settings)

Same bottom-border style:
```css
.key-input {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid var(--cds-border-strong);
  border-radius: 0;
  font-size: 14px;
  font-family: inherit;
  background: var(--cds-layer-02);
  color: var(--cds-text-primary);
  outline: none;
  margin-bottom: 12px;
  letter-spacing: 0.16px;
}

.key-input:focus {
  border-bottom: 2px solid var(--cds-interactive);
  padding-bottom: 9px;
}
```

### Buttons (Carbon Style)

```css
.btn {
  padding: 11px 16px;
  border: none;
  border-radius: 0;                                  /* Carbon sharp corners on buttons */
  font-size: 14px;
  font-family: inherit;
  font-weight: 400;
  cursor: pointer;
  transition: background 150ms ease;
  letter-spacing: 0.16px;
  line-height: 18px;
}

.btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--cds-interactive);
  color: var(--cds-text-on-color);
}

.btn-primary:not(:disabled):hover {
  background: var(--cds-interactive-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--cds-interactive);
  border: 1px solid var(--cds-interactive);
}

.btn-secondary:not(:disabled):hover {
  background: var(--cds-highlight);
}

.btn-danger {
  background: var(--cds-support-error);
  color: #ffffff;
}

.btn-danger:not(:disabled):hover {
  background: #b81922;    /* Red 70 — darker red */
}
```

### Provider Tabs

```css
.provider-tabs {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.provider-tab {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--cds-border-subtle);
  border-radius: 0;                                  /* Carbon sharp corners */
  background: var(--cds-layer-02);
  color: var(--cds-text-primary);
  font-size: 14px;
  font-family: inherit;
  font-weight: 400;
  cursor: pointer;
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.provider-tab:hover {
  background: var(--cds-layer-accent);
}

.provider-tab.active {
  background: var(--cds-interactive);
  color: var(--cds-text-on-color);
  border-color: var(--cds-interactive);
}

.key-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cds-support-success);
  flex-shrink: 0;
}

.provider-tab.active .key-dot {
  background: var(--cds-text-on-color);
}
```

### Status Indicators

```css
.test-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  line-height: 16px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.test-idle .status-dot {
  background: var(--cds-text-placeholder);
}

.test-testing .status-dot {
  background: var(--cds-support-warning);
  animation: pulse 1s infinite;
}

.test-success .status-dot {
  background: var(--cds-support-success);
}

.test-error .status-dot {
  background: var(--cds-support-error);
}

.saved-key-display {
  font-size: 12px;
  line-height: 16px;
  color: var(--cds-text-secondary);
  margin-bottom: 8px;
}

.saved-key-display code {
  background: var(--cds-layer-02);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.settings-note {
  font-size: 12px;
  line-height: 16px;
  color: var(--cds-text-placeholder);
  font-style: italic;
}
```

---

## 12. Typing Indicator

Apply bot message styling (teal left accent bar) and slow the animation:

```css
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--cds-layer-01);
  border: 1px solid var(--cds-border-subtle);
  border-left: 3px solid var(--cds-interactive);     /* Teal accent bar */
  border-radius: 0 4px 4px 0;
  width: fit-content;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--cds-icon-secondary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;       /* Slower: 1.4s (was 1.2s) */
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}
```

---

## 13. Side Panel

```css
.side-panel {
  width: 250px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--cds-border-subtle);
  background: var(--cds-background);                 /* Gray 10 background */
  overflow-y: auto;
}

.side-panel-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;                                         /* Section gap */
}

.side-panel-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.side-panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 8px 16px;
  border-top: 1px solid var(--cds-border-subtle);
  flex-shrink: 0;
}
```

---

## 14. Icon System

### Current State

`Icon.tsx` uses Material Design filled SVGs with `fill="currentColor"`. All icons are 24x24 viewBox.

### Target State

Replace with **stroke-based** Carbon-style icons. Same component API (`name`, `size`, `className`), but SVGs use `stroke="currentColor"` and `fill="none"` with `strokeWidth="1.5"`.

### New Icon Paths

Replace the `PATHS` record with a new structure that supports stroke-based rendering. Change the Icon component to render with `stroke` instead of `fill`:

```tsx
// Icon.tsx — Carbon stroke-based icons

import React from "react";

interface IconDef {
  viewBox: string;
  paths: string[];    // Each path is a d-attribute
  fill?: boolean;     // If true, use fill instead of stroke (e.g., shield)
}

const ICONS: Record<string, IconDef> = {
  shield: {
    viewBox: "0 0 20 20",
    paths: [
      "M10 1L2 4.5v5.5c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V4.5L10 1z",
      "M7 10l2 2 4-4"
    ],
    fill: false,
  },
  settings: {
    viewBox: "0 0 16 16",
    paths: [
      "M6.5 1h3l.4 2.1a5.5 5.5 0 011.3.7l2-.8 1.5 2.6-1.6 1.3a5.6 5.6 0 010 1.5l1.6 1.3-1.5 2.6-2-.8a5.5 5.5 0 01-1.3.7L9.5 15h-3l-.4-2.1a5.5 5.5 0 01-1.3-.7l-2 .8-1.5-2.6 1.6-1.3a5.6 5.6 0 010-1.5L1.3 6.3l1.5-2.6 2 .8a5.5 5.5 0 011.3-.7L6.5 1z",
      "M8 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
    ],
  },
  delete: {
    viewBox: "0 0 16 16",
    paths: [
      "M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M12.67 4v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4",
      "M6.67 7.33v4",
      "M9.33 7.33v4"
    ],
  },
  chevron_left: {
    viewBox: "0 0 16 16",
    paths: ["M10 12L6 8l4-4"],
  },
  chevron_right: {
    viewBox: "0 0 16 16",
    paths: ["M6 4l4 4-4 4"],
  },
  send: {
    viewBox: "0 0 16 16",
    paths: ["M14.5 1.5l-6 13-2.5-5.5L1.5 6.5l13-5z", "M14.5 1.5L6 9"],
  },
  check: {
    viewBox: "0 0 16 16",
    paths: ["M3 8l3.5 3.5L13 5"],
  },
  close: {
    viewBox: "0 0 16 16",
    paths: ["M12 4L4 12M4 4l8 8"],
  },
  external_link: {
    viewBox: "0 0 16 16",
    paths: [
      "M12 8.67v4A1.33 1.33 0 0110.67 14H3.33A1.33 1.33 0 012 12.67V5.33A1.33 1.33 0 013.33 4h4",
      "M10 2h4v4",
      "M6.67 9.33L14 2"
    ],
  },
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 16, className }: IconProps) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={icon.fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
```

**Important:** The default `size` changes from `18` to `16` to match Carbon's 16px icon standard. Update all `<Icon size={18}>` calls in `App.tsx` to `size={16}`.

### Shield Logo Exception

The shield in the header should be `size={20}` and use teal fill:
```tsx
<Icon name="shield" size={20} className="header-logo-icon" />
```
```css
.header-logo-icon {
  color: var(--cds-interactive);
}
```

---

## 15. CSS Variable Migration Map

Every old variable must be replaced. Here's the complete mapping:

| Old Variable | New Variable | Notes |
|-------------|-------------|-------|
| `--bg-primary` | `--cds-background` | Page background |
| `--bg-secondary` | `--cds-layer-01` | Cards and surfaces (previously gray, now white in light) |
| `--bg-tertiary` | `--cds-layer-accent` | Elevated surfaces |
| `--text-primary` | `--cds-text-primary` | |
| `--text-secondary` | `--cds-text-secondary` | |
| `--text-muted` | `--cds-text-placeholder` | |
| `--border` | `--cds-border-subtle` | Most borders |
| `--accent` | `--cds-interactive` | **Teal, not blue** |
| `--accent-light` | `--cds-highlight` | **Teal tint, not blue tint** |
| `--accent-text` | `--cds-text-on-color` | White |
| `--error` | `--cds-support-error` | |
| `--success` | `--cds-support-success` | |
| `--warning` | `--cds-support-warning` | |
| `--level-a` | `--cds-level-a` | Green (unchanged) |
| `--level-a-bg` | `--cds-level-a-bg` | |
| `--level-aa` | `--cds-level-aa` | **Teal** (was blue) |
| `--level-aa-bg` | `--cds-level-aa-bg` | **Teal tint** (was blue tint) |
| `--level-aaa` | `--cds-level-aaa` | Purple (unchanged) |
| `--level-aaa-bg` | `--cds-level-aaa-bg` | |
| `--radius` | `--cds-radius-sm` | 4px (was 8px) |
| `--radius-sm` | `--cds-radius-none` or `--cds-radius-sm` | Depends on context |
| `--shadow` | *(remove)* | Carbon doesn't use shadows |

### Blue Color Eradication Checklist

Search the entire codebase for these blue values and replace:

| Blue Value | Replace With | Context |
|-----------|-------------|---------|
| `#0d6efd` | `#00897B` | Accent/interactive |
| `#4dabf7` | `#4DB6AC` | Dark theme accent |
| `#e7f1ff` | `#e0f2f1` | Light highlight |
| `#cfe2ff` | `#e0f2f1` | Level AA background |
| `#1a3a5c` | `rgba(77, 182, 172, 0.1)` | Dark theme highlight |
| `#1a2d4a` | `rgba(77, 182, 172, 0.15)` | Dark theme level AA bg |

---

## 16. Dark Mode Verification

After implementing all changes, verify these contrast requirements:

| Element | Foreground | Background | Min Ratio |
|---------|-----------|------------|-----------|
| Body text | `#f4f4f4` | `#161616` | 4.5:1 (actual: ~15.4:1) |
| Secondary text | `#c6c6c6` | `#161616` | 4.5:1 (actual: ~10.5:1) |
| Teal interactive | `#4DB6AC` | `#161616` | 4.5:1 (actual: ~7.8:1) |
| Teal interactive | `#4DB6AC` | `#262626` | 4.5:1 (actual: ~6.3:1) |
| User bubble text | `#ffffff` | `#4DB6AC` | 4.5:1 (check — may need `#009688` bg in dark) |
| Placeholder text | `#6f6f6f` | `#393939` | 3:1 min (non-essential) |

**If user bubble contrast fails in dark mode:** Use `--cds-interactive-active` (`#009688`) as the user bubble background in dark theme to maintain white text readability.

---

## 17. Build & Verification Checklist

After implementing all changes:

- [ ] `npm run build` compiles with zero errors
- [ ] No blue hex values remain in `global.css` (search for `#0d6efd`, `#4dabf7`, `#cfe2ff`, `#e7f1ff`, `blue`)
- [ ] All old CSS variable names (`--bg-primary`, `--accent`, etc.) are fully replaced
- [ ] Light theme renders correctly — Gray 10 background, white cards, teal accents
- [ ] Dark theme renders correctly — Gray 100 background, Gray 90 cards, bright teal accents
- [ ] Bot messages have teal left accent bar (3px)
- [ ] User messages have darker teal right accent bar (3px)
- [ ] SC cards have sharp corners, no shadows
- [ ] Level AA badges are teal (not blue)
- [ ] All buttons follow Carbon patterns (sharp corners, teal primary)
- [ ] Text inputs have bottom-border-only style
- [ ] Header is 48px tall, proper tag styling
- [ ] Suggestion chips are pill-shaped with hover teal highlight
- [ ] Typing indicator has teal left accent bar
- [ ] All icons render as stroke-based outlines
- [ ] Provider tabs work correctly with new styling
- [ ] Font falls back gracefully if IBM Plex Sans doesn't load
- [ ] All existing functionality preserved (chat, search, AI providers, settings)

---

## Appendix: Complete CSS File Structure

The final `global.css` should be organized in this order:

1. `:root` (light theme tokens)
2. `@media (prefers-color-scheme: dark)` (dark theme tokens)
3. `.figma-dark` (Figma theme override)
4. Reset (`*`, `body`, `a`)
5. App Layout (`.app`)
6. Header (`.app-header`, `.header-*`, `.ai-badge`)
7. Icon buttons (`.icon-btn`)
8. App Body (`.app-body`)
9. Side Panel (`.side-panel`, `.side-panel-*`)
10. Chat View (`.chat-view`, `.messages-area`)
11. Messages (`.message`, `.message-user`, `.message-bot`, `.message-text`, `.bot-label`, `.sc-inline-ref`, `.bullet`)
12. SC Cards (`.sc-card`, `.sc-card-header`, `.sc-*`, `.level-*`)
13. Typing Indicator (`.typing-indicator`, `.dot`, `@keyframes bounce`)
14. Input Area (`.input-area`, `.chat-input`, `.send-btn`)
15. Settings Panel (`.settings-*`, `.key-input`, `.btn*`, `.test-*`, `.saved-key-display`)
16. Provider Tabs (`.provider-tabs`, `.provider-tab`, `.key-dot`)
17. Suggestion Chips (`.suggestion-chips`, `.chip`)
18. Scrollbar styles
19. Animations (`@keyframes fadeIn`, `@keyframes pulse`)
