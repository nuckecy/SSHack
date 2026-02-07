import type { WCAGCriterion } from "../providers/types";
import rawData from "../../../data/wcag-complete.json";

// Import and type the WCAG data at build time
export const wcagData: WCAGCriterion[] = rawData as WCAGCriterion[];

// Build a lookup map by ref_id for fast exact matching
export const wcagByRefId: Map<string, WCAGCriterion> = new Map(
  wcagData.map((sc) => [sc.ref_id, sc])
);
