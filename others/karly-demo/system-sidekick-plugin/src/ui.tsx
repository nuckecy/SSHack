import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { render } from '@create-figma-plugin/ui'
import '!./styles/ui.css'

// ── CONFIGURATION ──────────────────────────────────
// Update this after deploying the backend
const BACKEND_URL = 'http://localhost:3000'

// ── TYPES ──────────────────────────────────────────
interface MessageAction {
  type: 'place_component'
  componentName: string
  componentKey: string
  variant?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  action?: MessageAction
}

interface FigmaNode {
  name: string
  type: string
  width?: number
  height?: number
}

// ── MAIN UI COMPONENT ──────────────────────────────
function Plugin() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [figmaContext, setFigmaContext] = useState<FigmaNode[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Listen for Figma selection context updates
  useEffect(() => {
    on('SELECTION_CONTEXT', (data: { selection: FigmaNode[] }) => {
      setFigmaContext(data.selection)
    })

    on('PLACEMENT_RESULT', (data: { success: boolean; componentName?: string; error?: string }) => {
      if (data.success) {
        const msg: Message = {
          role: 'assistant',
          content: `Placed "${data.componentName}" in your design.`
        }
        setMessages((prev) => [...prev, msg])
      } else {
        const msg: Message = {
          role: 'assistant',
          content: `Could not place component: ${data.error}`
        }
        setMessages((prev) => [...prev, msg])
      }
    })
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages,
          context: figmaContext.length > 0 ? figmaContext : undefined
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        action: data.action
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const placeComponent = (action: MessageAction) => {
    emit('PLACE_COMPONENT', {
      componentKey: action.componentKey,
      variant: action.variant
    })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div class="app">
      {/* Header */}
      <div class="header">
        <h2>System Sidekick</h2>
        <p>Ask me about ShadCN components</p>
        {figmaContext.length > 0 && (
          <div class="context-badge">
            Selected: {figmaContext.map((n) => n.name).join(', ')}
          </div>
        )}
      </div>

      {/* Messages */}
      <div class="messages">
        {messages.length === 0 && (
          <div class="empty-state">
            <p class="empty-title">Hi! Ask me anything about ShadCN components.</p>
            <div class="suggestions">
              <button class="suggestion" onClick={() => { setInput('How should I show an error?'); }}>
                How should I show an error?
              </button>
              <button class="suggestion" onClick={() => { setInput('What button for a form submit?'); }}>
                What button for a form submit?
              </button>
              <button class="suggestion" onClick={() => { setInput('When should I use a dialog vs alert dialog?'); }}>
                Dialog vs Alert Dialog?
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} class={`message message-${msg.role}`}>
            <div class="message-content">{msg.content}</div>
            {msg.action && (
              <button class="place-button" onClick={() => placeComponent(msg.action!)}>
                Place in Figma
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div class="message message-assistant">
            <div class="loading">
              <span class="dot" /><span class="dot" /><span class="dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div class="input-area">
        <input
          type="text"
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about components..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}

export default render(Plugin)
