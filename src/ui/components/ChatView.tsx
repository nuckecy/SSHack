import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Message, ConversationTurn, WCAGCriterion, ProviderId } from "../providers/types";
import { PROVIDERS } from "../providers/registry";
import { buildPrompt } from "../knowledge/prompt-builder";
import { searchWCAG } from "../knowledge/search";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface ChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  apiKey: string;
  activeProvider: ProviderId;
  chipQueryRef: React.MutableRefObject<string | null>;
  chipTrigger: number;
}

// Meta queries that get hardcoded responses
const META_RESPONSES: Record<string, string> = {
  hello: "Hi! I'm System Sidekick, your WCAG 2.2 accessibility assistant. Ask me about contrast ratios, touch targets, focus indicators, form accessibility, or any WCAG success criterion.",
  hi: "Hi! I'm System Sidekick, your WCAG 2.2 accessibility assistant. Ask me about contrast ratios, touch targets, focus indicators, form accessibility, or any WCAG success criterion.",
  hey: "Hey! I'm your WCAG 2.2 accessibility assistant. What accessibility question can I help with?",
  help: "I can help with:\n- **WCAG success criteria** — Ask about any SC by number or topic\n- **Contrast requirements** — Minimum ratios for text and UI\n- **Touch targets** — Minimum sizes for interactive elements\n- **Focus indicators** — Visibility requirements\n- **Form accessibility** — Labels, errors, and inputs\n- **Keyboard navigation** — Requirements for keyboard users\n\nTry asking: \"What are the contrast requirements?\" or \"Tell me about SC 1.4.3\"",
  "what can you do": "I can help with:\n- **WCAG success criteria** — Ask about any SC by number or topic\n- **Contrast requirements** — Minimum ratios for text and UI\n- **Touch targets** — Minimum sizes for interactive elements\n- **Focus indicators** — Visibility requirements\n- **Form accessibility** — Labels, errors, and inputs\n- **Keyboard navigation** — Requirements for keyboard users\n\nTry asking: \"What are the contrast requirements?\" or \"Tell me about SC 1.4.3\"",
};

const MAX_HISTORY_TURNS = 6;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function ChatView({ messages, setMessages, apiKey, activeProvider, chipQueryRef, chipTrigger }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<ConversationTurn[]>([]);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasApiKey = apiKey.length > 0;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = 18.2; // 13px font * 1.4 line-height
      const maxHeight = lineHeight * 10;
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
      const isScrollable = textarea.scrollHeight > maxHeight;
      textarea.style.overflowY = isScrollable ? "auto" : "hidden";
      if (isScrollable) {
        textarea.classList.add("scrollable");
        textarea.classList.remove("scroll-faded");
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          textarea.classList.add("scroll-faded");
        }, 2000);
      } else {
        textarea.classList.remove("scrollable", "scroll-faded");
      }
    }
  }, [input]);

  const addMessage = useCallback(
    (role: "user" | "bot", text: string, cards?: WCAGCriterion[]) => {
      const msg: Message = {
        id: generateId(),
        role,
        text,
        cards,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    [setMessages]
  );

  const handleSend = useCallback(async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    setInput("");
    addMessage("user", query);

    // Check for meta queries
    const metaKey = query.toLowerCase();
    if (META_RESPONSES[metaKey]) {
      addMessage("bot", META_RESPONSES[metaKey]);
      return;
    }

    setIsLoading(true);

    try {
      const { systemPrompt, matchedCriteria } = buildPrompt(query);

      if (hasApiKey) {
        // AI mode: send to active provider with WCAG context
        try {
          const aiResponse = await PROVIDERS[activeProvider].sendMessage(
            query,
            systemPrompt,
            historyRef.current.slice(-MAX_HISTORY_TURNS),
            apiKey
          );

          // Update conversation history
          historyRef.current.push(
            { role: "user", text: query },
            { role: "assistant", text: aiResponse }
          );

          // Add bot message with optional SC cards
          addMessage("bot", aiResponse, matchedCriteria.length > 0 ? matchedCriteria : undefined);
        } catch (err) {
          // AI failed — fall back to keyword results
          const errorMsg =
            err instanceof Error ? err.message : "Unknown error";
          console.error("AI error:", errorMsg);

          if (matchedCriteria.length > 0) {
            addMessage(
              "bot",
              "Unable to reach AI. Here's what I found:",
              matchedCriteria
            );
          } else {
            addMessage(
              "bot",
              `AI error: ${errorMsg}. Try rephrasing your question or check your API key in settings.`
            );
          }
        }
      } else {
        // Keyword-only mode
        const results = searchWCAG(query, 5);
        if (results.length > 0) {
          addMessage(
            "bot",
            `Found ${results.length} relevant success criteria:`,
            results.map((r) => r.criterion)
          );
        } else {
          addMessage(
            "bot",
            "I couldn't find specific criteria for that query. Try asking about a specific topic like \"contrast\", \"focus\", or \"touch targets\". You can also ask about a specific SC number like \"SC 1.4.3\"."
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, hasApiKey, apiKey, activeProvider, addMessage]);

  // Handle chip clicks from side panel
  const processChipQuery = useCallback((query: string) => {
    addMessage("user", query);
    setIsLoading(true);

    const { systemPrompt, matchedCriteria } = buildPrompt(query);

    if (hasApiKey) {
      PROVIDERS[activeProvider].sendMessage(
        query,
        systemPrompt,
        historyRef.current.slice(-MAX_HISTORY_TURNS),
        apiKey
      )
        .then((aiResponse) => {
          historyRef.current.push(
            { role: "user", text: query },
            { role: "assistant", text: aiResponse }
          );
          addMessage("bot", aiResponse, matchedCriteria.length > 0 ? matchedCriteria : undefined);
        })
        .catch(() => {
          if (matchedCriteria.length > 0) {
            addMessage("bot", "Here's what I found:", matchedCriteria);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      const results = searchWCAG(query, 5);
      if (results.length > 0) {
        addMessage(
          "bot",
          `Found ${results.length} relevant success criteria:`,
          results.map((r) => r.criterion)
        );
      }
      setIsLoading(false);
    }
  }, [hasApiKey, apiKey, activeProvider, addMessage]);

  // Watch for chip trigger from parent
  useEffect(() => {
    if (chipTrigger > 0 && chipQueryRef.current) {
      const query = chipQueryRef.current;
      chipQueryRef.current = null;
      processChipQuery(query);
    }
  }, [chipTrigger, chipQueryRef, processChipQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-view">
      <div className="messages-area">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Ask about accessibility..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
