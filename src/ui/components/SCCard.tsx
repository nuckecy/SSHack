import { useState } from "react";
import type { WCAGCriterion } from "../providers/types";
import Icon from "./Icon";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface SCCardProps {
  criterion: WCAGCriterion;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

const LEVEL_STYLES: Record<string, string> = {
  A: "bg-[var(--cds-level-a-bg)] text-[var(--cds-level-a)] border-transparent",
  AA: "bg-[var(--cds-level-aa-bg)] text-[var(--cds-level-aa)] border-transparent",
  AAA: "bg-[var(--cds-level-aaa-bg)] text-[var(--cds-level-aaa)] border-transparent",
};

export default function SCCard({ criterion }: SCCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sc = criterion;

  const howToMeetUrl = `https://www.w3.org/WAI/WCAG22/quickref/#${sc.ref_id.replace(/\./g, "")}`;
  const understandingUrl = `https://www.w3.org/WAI/WCAG22/Understanding/${sc.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "")}`;

  const description = expanded
    ? sc.description
    : truncate(sc.description, 300);

  return (
    <Card className="gap-0 py-0 border-[var(--cds-border-subtle)] bg-card">
      <CardHeader className="px-4 py-3 gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-xs tracking-wide">SC {sc.ref_id}</span>
          <CardTitle className="flex-1 text-sm">{sc.title}</CardTitle>
          <Badge className={LEVEL_STYLES[sc.level] || ""}>
            Level {sc.level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3">
        <p className="text-sm leading-5 text-muted-foreground">
          {description}
          {sc.description.length > 300 && (
            <Button
              variant="link"
              size="xs"
              className="ml-1 h-auto p-0 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Show more"}
            </Button>
          )}
        </p>

        {expanded && sc.special_cases && sc.special_cases.length > 0 && (
          <div className="mt-3 text-sm text-muted-foreground leading-5">
            <strong>Exceptions:</strong>
            <ul className="pl-4 mt-1">
              {sc.special_cases.slice(0, 5).map((ex, i) => (
                <li key={i} className="mb-0.5">
                  <strong>{ex.title}:</strong>{" "}
                  {truncate(ex.description, 120)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 gap-4 border-t border-[var(--cds-border-subtle)]">
        <a
          href={howToMeetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary inline-flex items-center gap-1 no-underline hover:underline"
        >
          <Icon name="external_link" size={12} />
          How to Meet
        </a>
        <a
          href={understandingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary inline-flex items-center gap-1 no-underline hover:underline"
        >
          <Icon name="external_link" size={12} />
          Understanding
        </a>
      </CardFooter>
    </Card>
  );
}
