import React from "react";

export default function TypingIndicator() {
  return (
    <div className="message message-bot">
      <div className="typing-indicator">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
