import React from "react";

interface SuggestionChipsProps {
  onChipClick: (query: string) => void;
}

const SUGGESTIONS = [
  "Contrast requirements",
  "Touch target sizes",
  "Focus indicators",
  "Form accessibility",
  "Alt text rules",
];

export default function SuggestionChips({ onChipClick }: SuggestionChipsProps) {
  return (
    <div className="suggestion-chips">
      {SUGGESTIONS.map((label) => (
        <button
          key={label}
          className="chip"
          onClick={() => onChipClick(label)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
