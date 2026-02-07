export type ProviderId = "gemini" | "anthropic" | "openai";

export interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  /** Optional SC cards to display with this message */
  cards?: WCAGCriterion[];
  timestamp: number;
}

export interface WCAGCriterion {
  ref_id: string;
  title: string;
  description: string;
  url: string;
  level: "A" | "AA" | "AAA";
  special_cases?: SpecialCase[];
  notes?: Note[];
  references?: Reference[];
}

export interface SpecialCase {
  type: "exception" | "note";
  title: string;
  description: string;
}

export interface Note {
  content: string;
}

export interface Reference {
  title: string;
  url: string;
}

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

export interface ProviderConfig {
  name: string;
  keyPlaceholder: string;
  helpUrl: string;
  helpLabel: string;
  privacyNote: string;
}

export interface ProviderKeys {
  gemini: string;
  anthropic: string;
  openai: string;
}

// ─── Canvas Selection Types ────────────────────────────────────

export interface SerializedPaint {
  type: string;
  visible: boolean;
  opacity: number;
  color?: string;       // hex string e.g. "#007AFF"
  display?: string;     // human-readable e.g. "#007AFF 100%"
}

export interface SerializedAutoLayout {
  layoutMode: "HORIZONTAL" | "VERTICAL";
  itemSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
}

export interface SerializedTextProps {
  characters: string;
  fontSize: number | "MIXED";
  fontName: string | "MIXED";
  lineHeight: string | "MIXED";
  letterSpacing: string | "MIXED";
  textAlignHorizontal: string;
  textAlignVertical: string;
}

export interface SerializedComponentInfo {
  componentName: string;
  description: string;
  isRemote: boolean;
  key: string;
  variantProperties?: Record<string, string>;
  componentSetName?: string;
}

export interface SerializedChildNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  width?: number;
  height?: number;
  characters?: string;
  fills?: SerializedPaint[];
  children?: SerializedChildNode[];
}

export interface SelectionData {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  fills?: SerializedPaint[];
  strokes?: SerializedPaint[];
  strokeWeight?: number | "MIXED";
  cornerRadius?: number | "MIXED";
  autoLayout?: SerializedAutoLayout;
  textProps?: SerializedTextProps;
  componentInfo?: SerializedComponentInfo;
  children?: SerializedChildNode[];
  descendantCount: number;
  timestamp: number;
}
