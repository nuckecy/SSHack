import React from "react";
import type { Message } from "../providers/types";
import SCCard from "./SCCard";

interface MessageBubbleProps {
  message: Message;
}

/**
 * Parses basic markdown-ish formatting into HTML.
 * Supports: **bold**, *italic*, bullet points (- or *), SC references
 */
function formatText(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // SC references → inline Carbon tag
    .replace(
      /SC\s+(\d+\.\d+\.\d+)/g,
      '<span class="sc-inline-ref">SC $1</span>'
    )
    // Line breaks
    .replace(/\n/g, "<br />");

  // Bullet points: lines starting with "- " or "* " — use CSS teal dot, no bullet character
  html = html.replace(
    /(?:^|<br \/>)\s*[-\u2022]\s+(.+?)(?=<br \/>|$)/g,
    '<div class="bullet">$1</div>'
  );

  return html;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "message-user" : "message-bot"}`}>
      {!isUser && <div className="bot-label">Sidekick</div>}
      <div
        className="message-text"
        dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
      />
      {message.cards && message.cards.length > 0 && (
        <div className="message-cards">
          {message.cards.map((sc) => (
            <SCCard key={sc.ref_id} criterion={sc} />
          ))}
        </div>
      )}
    </div>
  );
}
