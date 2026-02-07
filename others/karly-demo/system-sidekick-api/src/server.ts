import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// ── Middleware ───────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Load Component Knowledge Base ───────────────────
const kbPath = path.join(__dirname, '..', 'data', 'shadcn-components.json')
const componentKnowledge = JSON.parse(fs.readFileSync(kbPath, 'utf-8'))

// ── Claude Client ───────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// ── System Prompt ───────────────────────────────────
const SYSTEM_PROMPT = `You are System Sidekick, an AI assistant that helps designers use the ShadCN design system correctly in Figma.

# Your Knowledge Base
You have complete knowledge of the following ShadCN components, their variants, design tokens, accessibility requirements, and anti-patterns:

${JSON.stringify(componentKnowledge, null, 2)}

# Your Role
- Help designers choose the right ShadCN component for their use case.
- Provide specific guidance with exact token names and accessibility requirements.
- Explain WHY a component or variant is recommended — teach the system, don't just prescribe.
- If the user has selected something in Figma (context provided), factor that into your recommendation.

# Response Format

When recommending a component, structure your response like this:

**Recommendation:** [Component Name] — [Variant]

**Why this component:**
[2-3 sentences explaining why this is the right choice vs alternatives. Reference specific system rules.]

**Design Tokens:**
- [property]: \`[exact token name]\`

**Accessibility:**
- [Key requirement 1]
- [Key requirement 2]

**Watch out for:**
- [Relevant anti-pattern if applicable]

If the user could benefit from placing this component, end with:
"Would you like me to place this in your design?"

# When User Confirms Placement

When the user says "yes", "place it", "add it", or similar confirmation, respond with ONLY this JSON (no markdown, no extra text):
{"response":"Placing [Component] ([variant]) in your design.","action":{"type":"place_component","componentName":"[Component]","componentKey":"[figmaKey from knowledge base]","variant":"[variant name]"}}

Use the exact figmaKey from the knowledge base. Only offer placement for components that have a real figmaKey (not "YOUR_KEY_HERE").

# Critical Rules
1. ONLY recommend components that exist in your knowledge base. Never invent components.
2. ALWAYS include accessibility guidance.
3. ALWAYS explain why — teach the designer, don't just tell them.
4. If you're unsure or the question is outside your knowledge, say so explicitly: "I don't have enough information about that in the ShadCN system to give confident guidance."
5. Keep responses concise — designers are working, not reading essays.
6. When the user's Figma selection context is provided, reference it specifically in your guidance.
`

// ── Types ───────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface FigmaNode {
  name: string
  type: string
  width?: number
  height?: number
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
  context?: FigmaNode[]
}

// ── Auto-detect component from Claude's response ────
// Scans the response text for component names from the knowledge base.
// If found and the component has a real Figma key, returns a placement action.
function detectComponentAction(text: string): any | null {
  const components = componentKnowledge.components
  const textLower = text.toLowerCase()

  for (const comp of components) {
    // Skip components without real keys
    if (!comp.figmaKey || comp.figmaKey === 'YOUR_KEY_HERE') continue

    // Check if this component is mentioned in the response
    const nameLower = comp.name.toLowerCase()
    if (!textLower.includes(nameLower)) continue

    // Try to detect which variant was recommended
    let matchedVariant = comp.variants[0] // default to first variant
    for (const variant of comp.variants) {
      const variantKey = variant.figmaKey
      if (variantKey === 'YOUR_KEY_HERE') continue

      // Check if this variant name appears near the component name
      if (textLower.includes(variant.name.toLowerCase())) {
        matchedVariant = variant
        break
      }
    }

    // Use the variant's key if available, otherwise the component's key
    const key = (matchedVariant.figmaKey && matchedVariant.figmaKey !== 'YOUR_KEY_HERE')
      ? matchedVariant.figmaKey
      : comp.figmaKey

    return {
      type: 'place_component',
      componentName: comp.name,
      componentKey: key,
      variant: matchedVariant.name
    }
  }

  return null
}

// ── Routes ──────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', components: componentKnowledge.components.length })
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history = [], context }: ChatRequest = req.body

  if (!message) {
    return res.status(400).json({ response: 'No message provided.' })
  }

  // Build message with optional Figma context
  let userContent = message
  if (context && context.length > 0) {
    const contextStr = context
      .map((n) => `${n.name} (${n.type}${n.width ? `, ${n.width}x${n.height}` : ''})`)
      .join(', ')
    userContent = `[Figma selection: ${contextStr}]\n\n${message}`
  }

  // Build conversation messages
  const messages: Anthropic.MessageParam[] = [
    ...history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userContent }
  ]

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''

    // Try to parse as JSON (placement action response)
    try {
      const parsed = JSON.parse(content)
      if (parsed.response && parsed.action) {
        return res.json(parsed)
      }
    } catch {
      // Not JSON — try to auto-detect recommended component
    }

    // Auto-detect: scan Claude's text for a component name and attach placement action
    const action = detectComponentAction(content)
    return res.json({ response: content, ...(action ? { action } : {}) })
  } catch (error: any) {
    console.error('Claude API error:', error.message || error)
    return res.status(500).json({
      response: 'Sorry, I encountered an error. Please try again.'
    })
  }
})

// ── Start Server ────────────────────────────────────
app.listen(PORT, () => {
  console.log(`System Sidekick API running on http://localhost:${PORT}`)
  console.log(`Loaded ${componentKnowledge.components.length} components from knowledge base`)
})
