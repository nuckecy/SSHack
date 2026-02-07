import Icon from "./Icon";
import { Button } from "./ui/button";

interface SuggestionChipsProps {
  onChipClick: (query: string) => void;
}

const SUGGESTIONS: { label: string; icon: string; query: string }[] = [
  { label: "Find a component", icon: "search", query: "Contrast requirements" },
  { label: "Check accessibility", icon: "accessibility", query: "Focus indicators" },
  { label: "Get token values", icon: "token", query: "Touch target sizes" },
  { label: "Usage guidelines", icon: "book", query: "Form accessibility" },
];

export default function SuggestionChips({ onChipClick }: SuggestionChipsProps) {
  return (
    <div className="suggestion-chips">
      {SUGGESTIONS.map(({ label, icon, query }) => (
        <Button
          key={label}
          variant="outline"
          className="chip"
          onClick={() => onChipClick(query)}
        >
          <Icon name={icon} size={14} />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
}
