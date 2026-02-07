import React from "react";
import type { SelectionData } from "../providers/types";

interface SelectionBarProps {
  selectionData: SelectionData | null;
  additionalCount?: number;
  onAskAbout: (query: string) => void;
}

function typeBadgeLabel(type: string): string {
  const map: Record<string, string> = {
    FRAME: "Frame",
    GROUP: "Group",
    COMPONENT: "Component",
    COMPONENT_SET: "Component Set",
    INSTANCE: "Instance",
    TEXT: "Text",
    RECTANGLE: "Rectangle",
    ELLIPSE: "Ellipse",
    LINE: "Line",
    VECTOR: "Vector",
    STAR: "Star",
    POLYGON: "Polygon",
    BOOLEAN_OPERATION: "Boolean",
    SECTION: "Section",
  };
  return map[type] || type;
}

export default function SelectionBar({ selectionData, additionalCount, onAskAbout }: SelectionBarProps) {
  if (!selectionData) {
    return (
      <div className="selection-bar selection-bar--empty">
        <span className="selection-bar-placeholder">Select a layer to inspect</span>
      </div>
    );
  }

  const handleAsk = () => {
    const name = selectionData.name;
    const type = typeBadgeLabel(selectionData.type);
    onAskAbout(`Is this ${type.toLowerCase()} "${name}" accessible? Check for any WCAG issues.`);
  };

  return (
    <div className="selection-bar">
      <div className="selection-bar-info">
        <span className="selection-type-badge">{typeBadgeLabel(selectionData.type)}</span>
        <span className="selection-bar-name" title={selectionData.name}>
          {selectionData.name}
        </span>
        <span className="selection-bar-dims">
          {selectionData.width}x{selectionData.height}
        </span>
        {additionalCount && additionalCount > 0 && (
          <span className="selection-bar-more">(+{additionalCount} more)</span>
        )}
      </div>
      <button className="selection-ask-btn" onClick={handleAsk}>
        Ask about this
      </button>
    </div>
  );
}
