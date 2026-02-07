import React, { useState } from "react";
import type { SelectionData, SerializedChildNode, SerializedPaint } from "../providers/types";

interface SelectionPanelProps {
  selectionData: SelectionData;
}

/** Round to integer, or 1 decimal if fractional */
function r(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

function typeBadge(type: string): string {
  const map: Record<string, string> = {
    FRAME: "Frame", GROUP: "Group", COMPONENT: "Component",
    COMPONENT_SET: "Set", INSTANCE: "Instance", TEXT: "Text",
    RECTANGLE: "Rect", ELLIPSE: "Ellipse", LINE: "Line",
    VECTOR: "Vector", STAR: "Star", POLYGON: "Polygon",
    BOOLEAN_OPERATION: "Bool", SECTION: "Section",
  };
  return map[type] || type;
}

/** Strip Figma internal IDs from property names: "Label#21642:146" → "Label" */
function cleanPropName(name: string): string {
  return name.replace(/#\d+:\d+/g, "");
}

/** Clean variant value — node IDs like "1781:418" are not useful to show */
function cleanPropValue(value: string): string {
  // If value is purely a node ID pattern (digits:digits), hide it
  if (/^\d+:\d+$/.test(value.trim())) return "";
  return value;
}

/** Collapsible section with chevron */
function Section({ label, defaultOpen = false, count, children }: {
  label: string; defaultOpen?: boolean; count?: number; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="sp-section">
      <button className="sp-section-toggle" onClick={() => setOpen(!open)}>
        <span className={`sp-chevron ${open ? "sp-chevron--open" : ""}`}>&#9654;</span>
        <span className="sp-section-label">{label}</span>
        {count != null && <span className="sp-section-count">{count}</span>}
      </button>
      {open && <div className="sp-section-body">{children}</div>}
    </div>
  );
}

function ColorSwatch({ paint }: { paint: SerializedPaint }) {
  if (!paint.color) return <span className="color-swatch-label">{paint.type}</span>;
  return (
    <span className="color-swatch-row">
      <span className="color-swatch" style={{ background: paint.color }} />
      <span className="color-swatch-label">{paint.color}</span>
    </span>
  );
}

function ChildTree({ children, depth = 0 }: { children: SerializedChildNode[]; depth?: number }) {
  if (!children || children.length === 0) return null;
  return (
    <ul className="child-tree" style={{ marginLeft: depth > 0 ? 10 : 0 }}>
      {children.map((child) => (
        <li key={child.id} className={`child-tree-item ${!child.visible ? "child-hidden" : ""}`}>
          <span className="child-tree-badge">{typeBadge(child.type)}</span>
          <span className="child-tree-name">{child.name}</span>
          {child.width != null && child.height != null && (
            <span className="child-tree-dims">{child.width}x{child.height}</span>
          )}
          {child.characters && (
            <span className="child-tree-text">"{child.characters.slice(0, 30)}{child.characters.length > 30 ? "..." : ""}"</span>
          )}
          {child.children && child.children.length > 0 && (
            <ChildTree children={child.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function SelectionPanel({ selectionData }: SelectionPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const sel = selectionData;

  const visibleFills = sel.fills?.filter((f) => f.visible) || [];
  const visibleStrokes = sel.strokes?.filter((f) => f.visible) || [];
  const hasComponent = !!sel.componentInfo;
  const variantEntries = sel.componentInfo?.variantProperties
    ? Object.entries(sel.componentInfo.variantProperties)
    : [];
  // Filter to only "real" variants (skip boolean/instance-swap internals with long values)
  const cleanVariants = variantEntries
    .map(([k, v]) => [cleanPropName(k), cleanPropValue(v)] as [string, string])
    .filter(([k, v]) => k.length > 0 && k.length < 30 && v.length > 0);

  return (
    <div className="selection-panel">
      <button className="selection-panel-header" onClick={() => setExpanded(!expanded)}>
        <span className={`sp-chevron ${expanded ? "sp-chevron--open" : ""}`}>&#9654;</span>
        <span className="selection-type-badge">{typeBadge(sel.type)}</span>
        <span className="selection-panel-name">{sel.name}</span>
        <span className="selection-panel-dims">{r(sel.width)}x{r(sel.height)}</span>
      </button>

      {expanded && (
        <div className="selection-panel-body">

          {/* Always-visible summary row */}
          <div className="sp-summary">
            {hasComponent && (
              <div className="sp-summary-row">
                <span className="sp-summary-key">Source</span>
                <span className="sp-summary-val">
                  {sel.componentInfo!.componentSetName
                    ? `${sel.componentInfo!.componentSetName} / ${sel.componentInfo!.componentName}`
                    : sel.componentInfo!.componentName}
                  {sel.componentInfo!.isRemote && (
                    <span className="selection-library-badge">Library</span>
                  )}
                </span>
              </div>
            )}
            {cleanVariants.length > 0 && (
              <div className="sp-summary-row">
                <span className="sp-summary-key">Variants</span>
                <span className="sp-summary-val sp-variant-list">
                  {cleanVariants.map(([k, v]) => (
                    <span key={k} className="selection-variant-chip">{k}={v}</span>
                  ))}
                </span>
              </div>
            )}
            {sel.cornerRadius != null && sel.cornerRadius !== 0 && (
              <div className="sp-summary-row">
                <span className="sp-summary-key">Radius</span>
                <span className="sp-summary-val">
                  {sel.cornerRadius === "MIXED" ? "Mixed" : `${r(sel.cornerRadius as number)}px`}
                </span>
              </div>
            )}
          </div>

          {/* Fills — collapsible */}
          {visibleFills.length > 0 && (
            <Section label="Fills" count={visibleFills.length} defaultOpen={visibleFills.length <= 3}>
              <div className="selection-panel-colors">
                {visibleFills.map((f, i) => <ColorSwatch key={i} paint={f} />)}
              </div>
            </Section>
          )}

          {/* Strokes — collapsible */}
          {visibleStrokes.length > 0 && (
            <Section label="Strokes" defaultOpen>
              <div className="selection-panel-colors">
                {visibleStrokes.map((f, i) => <ColorSwatch key={i} paint={f} />)}
              </div>
              {sel.strokeWeight != null && (
                <div className="sp-detail-row">
                  Weight: {sel.strokeWeight === "MIXED" ? "Mixed" : `${r(sel.strokeWeight as number)}px`}
                </div>
              )}
            </Section>
          )}

          {/* Auto Layout — collapsible */}
          {sel.autoLayout && (
            <Section label="Auto Layout" defaultOpen={false}>
              <div className="sp-detail-grid">
                <span className="sp-detail-key">Direction</span>
                <span>{sel.autoLayout.layoutMode === "HORIZONTAL" ? "Horizontal" : "Vertical"}</span>
                <span className="sp-detail-key">Gap</span>
                <span>{r(sel.autoLayout.itemSpacing)}px</span>
                <span className="sp-detail-key">Padding</span>
                <span>
                  {r(sel.autoLayout.paddingTop)} {r(sel.autoLayout.paddingRight)} {r(sel.autoLayout.paddingBottom)} {r(sel.autoLayout.paddingLeft)}
                </span>
              </div>
            </Section>
          )}

          {/* Text — collapsible */}
          {sel.textProps && (
            <Section label="Text" defaultOpen>
              <div className="sp-text-content">
                "{sel.textProps.characters.slice(0, 120)}{sel.textProps.characters.length > 120 ? "..." : ""}"
              </div>
              <div className="sp-detail-grid">
                {sel.textProps.fontName !== "MIXED" && (
                  <><span className="sp-detail-key">Font</span><span>{sel.textProps.fontName}</span></>
                )}
                {sel.textProps.fontSize !== "MIXED" && (
                  <><span className="sp-detail-key">Size</span><span>{sel.textProps.fontSize}px</span></>
                )}
                {sel.textProps.lineHeight !== "MIXED" && sel.textProps.lineHeight !== "AUTO" && (
                  <><span className="sp-detail-key">Line H</span><span>{sel.textProps.lineHeight}</span></>
                )}
              </div>
            </Section>
          )}

          {/* Children — collapsible */}
          {sel.children && sel.children.length > 0 && (
            <Section label="Children" count={sel.descendantCount} defaultOpen={sel.descendantCount <= 6}>
              <ChildTree children={sel.children} />
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
