import React, { useState, useEffect, useRef } from "react";
import type { Message } from "../providers/types";
import SCCard from "./SCCard";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onStreamingDone?: () => void;
}

/**
 * Parses basic markdown-ish formatting into HTML.
 * Handles bullets first (line-by-line), then bold/italic/SC refs.
 * Detects indented sub-bullets and avoids <br /> between consecutive bullets.
 */
function formatText(text: string): string {
  const lines = text.split("\n");
  const parts: string[] = [];
  let prevWasBullet = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const indent = line.length - line.trimStart().length;
    const isBullet = /^[-*\u2022]\s+/.test(trimmed);

    if (isBullet) {
      const content = trimmed.replace(/^[-*\u2022]\s+/, "");
      const cls = indent >= 2 ? "bullet-sub" : "bullet";
      parts.push('<div class="' + cls + '">' + formatInline(content) + "</div>");
      prevWasBullet = true;
    } else {
      if (prevWasBullet && trimmed === "") {
        prevWasBullet = false;
        continue;
      }
      if (parts.length > 0 && !prevWasBullet) {
        parts.push("<br />" + formatInline(line));
      } else {
        parts.push(formatInline(line));
      }
      prevWasBullet = false;
    }
  }

  return parts.join("");
}

/** Format inline markdown: bold, italic, SC refs, HTML escaping */
function formatInline(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /SC\s+(\d+\.\d+\.\d+)/g,
      '<span class="sc-inline-ref">SC $1</span>'
    );
}

/** Split text into word tokens preserving whitespace and newlines */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) || [];
}

const WORDS_PER_TICK = 2;
const TICK_MS = 25;
const CARD_STAGGER_MS = 400;

function BotAvatar() {
  return (
    <div className="message-avatar message-avatar--bot">
      <svg width="14" height="14" viewBox="-1 -1 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 1L2 4.5v5.5c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V4.5L10 1z" />
        <path d="M7 10l2 2 4-4" />
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="message-avatar message-avatar--user">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    </div>
  );
}

function StreamingText({ text, onDone }: { text: string; onDone: () => void }) {
  const tokens = useRef(tokenize(text));
  const [wordIndex, setWordIndex] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const total = tokens.current.length;
    if (wordIndex >= total) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
      return;
    }
    const timer = setTimeout(() => {
      setWordIndex((i) => Math.min(i + WORDS_PER_TICK, total));
    }, TICK_MS);
    return () => clearTimeout(timer);
  }, [wordIndex, onDone]);

  const visible = tokens.current.slice(0, wordIndex).join("");
  return (
    <div
      className="message-text"
      dangerouslySetInnerHTML={{ __html: formatText(visible) }}
    />
  );
}

export default function MessageBubble({ message, isStreaming, onStreamingDone }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const cardCount = message.cards?.length || 0;
  const [textDone, setTextDone] = useState(!isStreaming);
  const [showRefPrompt, setShowRefPrompt] = useState(!isStreaming && cardCount > 0);
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [visibleCards, setVisibleCards] = useState(0);
  const staggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextDone = () => {
    setTextDone(true);
    if (cardCount > 0) {
      // Show the "View references" prompt after text is done
      setTimeout(() => setShowRefPrompt(true), 200);
    }
    onStreamingDone?.();
  };

  const handleRevealCards = () => {
    setCardsRevealed(true);
    setShowRefPrompt(false);
    // Stagger cards in one by one
    revealNextCard(1);
  };

  const revealNextCard = (nextIndex: number) => {
    setVisibleCards(nextIndex);
    if (nextIndex < cardCount) {
      staggerTimerRef.current = setTimeout(() => revealNextCard(nextIndex + 1), CARD_STAGGER_MS);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (staggerTimerRef.current) clearTimeout(staggerTimerRef.current);
    };
  }, []);

  return (
    <div className={`message ${isUser ? "message-user" : "message-bot"}`}>
      {isUser ? (
        <div className="message-row message-row--user">
          <div className="message-content">
            <div
              className="message-text"
              dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
            />
          </div>
          <UserAvatar />
        </div>
      ) : (
        <>
          <div className="message-header-row">
            <BotAvatar />
            <div className="bot-label">Sidekick</div>
          </div>
          <div className="message-bot-body">
            {isStreaming && !textDone ? (
              <StreamingText text={message.text} onDone={handleTextDone} />
            ) : (
              <div
                className="message-text"
                dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
              />
            )}

            {/* Prompt to view WCAG references */}
            {showRefPrompt && !cardsRevealed && (
              <button className="ref-prompt-btn" onClick={handleRevealCards}>
                View {cardCount} WCAG reference{cardCount > 1 ? "s" : ""}
              </button>
            )}

            {/* Staggered SC cards */}
            {cardsRevealed && message.cards && visibleCards > 0 && (
              <div className="message-cards">
                {message.cards.slice(0, visibleCards).map((sc) => (
                  <div key={sc.ref_id} className="card-stagger-in">
                    <SCCard criterion={sc} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
