import React, { useState } from "react";
import type { WCAGCriterion } from "../providers/types";
import Icon from "./Icon";

interface SCCardProps {
  criterion: WCAGCriterion;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

function getLevelColor(level: string): string {
  switch (level) {
    case "A":
      return "level-a";
    case "AA":
      return "level-aa";
    case "AAA":
      return "level-aaa";
    default:
      return "";
  }
}

export default function SCCard({ criterion }: SCCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sc = criterion;

  // Build reference links
  const howToMeetUrl = `https://www.w3.org/WAI/WCAG22/quickref/#${sc.ref_id.replace(/\./g, "")}`;
  const understandingUrl = `https://www.w3.org/WAI/WCAG22/Understanding/${sc.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "")}`;

  const description = expanded
    ? sc.description
    : truncate(sc.description, 300);

  return (
    <div className="sc-card">
      <div className="sc-card-header">
        <span className="sc-ref-id">SC {sc.ref_id}</span>
        <span className="sc-title">{sc.title}</span>
        <span className={`sc-level ${getLevelColor(sc.level)}`}>
          Level {sc.level}
        </span>
      </div>

      <p className="sc-description">
        {description}
        {sc.description.length > 300 && (
          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </p>

      {expanded && sc.special_cases && sc.special_cases.length > 0 && (
        <div className="sc-exceptions">
          <strong>Exceptions:</strong>
          <ul>
            {sc.special_cases.slice(0, 5).map((ex, i) => (
              <li key={i}>
                <strong>{ex.title}:</strong>{" "}
                {truncate(ex.description, 120)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sc-links">
        <a href={howToMeetUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="external_link" size={12} />
          How to Meet
        </a>
        <a href={understandingUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="external_link" size={12} />
          Understanding
        </a>
      </div>
    </div>
  );
}
