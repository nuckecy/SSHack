// Main thread — runs in Figma's sandbox
// Has access to Figma API but NO DOM, NO fetch, NO browser APIs

figma.showUI(__html__, {
  width: 770,
  height: 640,
  themeColors: true,
});

// ─── Helpers ────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  const to8 = (v: number) => Math.round(v * 255);
  const hex = (v: number) => to8(v).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

function serializePaints(paints: readonly Paint[] | typeof figma.mixed): any[] {
  if (paints === figma.mixed) return [];
  return (paints as readonly Paint[]).map((p) => {
    const base: any = {
      type: p.type,
      visible: p.visible !== false,
      opacity: p.opacity ?? 1,
    };
    if (p.type === "SOLID") {
      const c = (p as SolidPaint).color;
      base.color = rgbToHex(c.r, c.g, c.b);
      const opacityPct = Math.round((base.opacity) * 100);
      base.display = `${base.color} ${opacityPct}%`;
    }
    return base;
  });
}

function countDescendants(node: SceneNode): number {
  let count = 0;
  if ("children" in node) {
    for (const child of (node as ChildrenMixin & SceneNode).children) {
      count += 1 + countDescendants(child);
    }
  }
  return count;
}

function serializeChildren(
  children: readonly SceneNode[],
  depth: number,
  maxDepth: number = 3,
  maxPerLevel: number = 20
): any[] {
  if (depth >= maxDepth) return [];
  const limited = children.slice(0, maxPerLevel);
  return limited.map((child) => {
    const entry: any = {
      id: child.id,
      name: child.name,
      type: child.type,
      visible: child.visible,
    };
    if ("width" in child) entry.width = Math.round((child as any).width);
    if ("height" in child) entry.height = Math.round((child as any).height);
    if (child.type === "TEXT") {
      entry.characters = (child as TextNode).characters;
    }
    if ("fills" in child) {
      entry.fills = serializePaints((child as GeometryMixin).fills);
    }
    if ("children" in child) {
      entry.children = serializeChildren(
        (child as ChildrenMixin & SceneNode).children,
        depth + 1,
        maxDepth,
        maxPerLevel
      );
    }
    return entry;
  });
}

function extractVariantProperties(node: InstanceNode): Record<string, string> | undefined {
  try {
    const props = node.componentProperties;
    if (!props || Object.keys(props).length === 0) return undefined;
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(props)) {
      result[key] = String(val.value);
    }
    return result;
  } catch {
    return undefined;
  }
}

function inspectNode(node: SceneNode): any {
  const data: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: "width" in node ? Math.round((node as any).width) : 0,
    height: "height" in node ? Math.round((node as any).height) : 0,
    opacity: "opacity" in node ? (node as any).opacity : 1,
    visible: node.visible,
    descendantCount: countDescendants(node),
    timestamp: Date.now(),
  };

  // Fills & strokes
  if ("fills" in node) {
    data.fills = serializePaints((node as GeometryMixin).fills);
  }
  if ("strokes" in node) {
    data.strokes = serializePaints((node as GeometryMixin).strokes);
  }
  if ("strokeWeight" in node) {
    const sw = (node as any).strokeWeight;
    data.strokeWeight = sw === figma.mixed ? "MIXED" : sw;
  }

  // Corner radius
  if ("cornerRadius" in node) {
    const cr = (node as any).cornerRadius;
    data.cornerRadius = cr === figma.mixed ? "MIXED" : cr;
  }

  // Auto-layout
  if ("layoutMode" in node) {
    const frame = node as FrameNode;
    if (frame.layoutMode !== "NONE") {
      data.autoLayout = {
        layoutMode: frame.layoutMode,
        itemSpacing: frame.itemSpacing,
        paddingTop: frame.paddingTop,
        paddingRight: frame.paddingRight,
        paddingBottom: frame.paddingBottom,
        paddingLeft: frame.paddingLeft,
        primaryAxisAlignItems: frame.primaryAxisAlignItems,
        counterAxisAlignItems: frame.counterAxisAlignItems,
      };
    }
  }

  // Text properties
  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    const fontSize = textNode.fontSize;
    const fontName = textNode.fontName;
    const lineHeight = textNode.lineHeight;
    const letterSpacing = textNode.letterSpacing;

    data.textProps = {
      characters: textNode.characters,
      fontSize: fontSize === figma.mixed ? "MIXED" : fontSize,
      fontName: fontName === figma.mixed
        ? "MIXED"
        : `${(fontName as FontName).family} ${(fontName as FontName).style}`,
      lineHeight: lineHeight === figma.mixed
        ? "MIXED"
        : (() => {
            const lh = lineHeight as LineHeight;
            if (lh.unit === "AUTO") return "AUTO";
            return `${(lh as any).value}${lh.unit === "PERCENT" ? "%" : "px"}`;
          })(),
      letterSpacing: letterSpacing === figma.mixed
        ? "MIXED"
        : (() => {
            const ls = letterSpacing as LetterSpacing;
            return `${(ls as any).value}${ls.unit === "PERCENT" ? "%" : "px"}`;
          })(),
      textAlignHorizontal: textNode.textAlignHorizontal,
      textAlignVertical: textNode.textAlignVertical,
    };
  }

  // Component info
  if (node.type === "INSTANCE") {
    const instance = node as InstanceNode;
    const main = instance.mainComponent;
    if (main) {
      data.componentInfo = {
        componentName: main.name,
        description: main.description || "",
        isRemote: main.remote,
        key: main.key,
        variantProperties: extractVariantProperties(instance),
        componentSetName: main.parent?.type === "COMPONENT_SET"
          ? main.parent.name
          : undefined,
      };
    }
  } else if (node.type === "COMPONENT") {
    const comp = node as ComponentNode;
    data.componentInfo = {
      componentName: comp.name,
      description: comp.description || "",
      isRemote: comp.remote,
      key: comp.key,
      componentSetName: comp.parent?.type === "COMPONENT_SET"
        ? comp.parent.name
        : undefined,
    };
  } else if (node.type === "COMPONENT_SET") {
    const set = node as ComponentSetNode;
    data.componentInfo = {
      componentName: set.name,
      description: set.description || "",
      isRemote: set.remote,
      key: set.key,
    };
  }

  // Children tree (bounded)
  if ("children" in node) {
    data.children = serializeChildren(
      (node as ChildrenMixin & SceneNode).children,
      0
    );
  }

  return data;
}

// ─── Auto-push selection on change ──────────────────────────────

figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "selection-changed", data: null });
  } else {
    const data = inspectNode(selection[0]);
    if (selection.length > 1) {
      data.additionalCount = selection.length - 1;
    }
    figma.ui.postMessage({ type: "selection-changed", data });
  }
});

// ─── Message handler ────────────────────────────────────────────

figma.ui.onmessage = async (msg: { type: string; [key: string]: any }) => {
  switch (msg.type) {
    case "resize":
      figma.ui.resize(msg.width, msg.height);
      break;

    case "notify":
      figma.notify(msg.message, { timeout: msg.timeout || 2000 });
      break;

    case "storage-get":
      figma.clientStorage.getAsync(msg.key).then((value) => {
        figma.ui.postMessage({ type: "storage-get-result", key: msg.key, value: value || "" });
      });
      break;

    case "storage-set":
      figma.clientStorage.setAsync(msg.key, msg.value);
      break;

    case "storage-delete":
      figma.clientStorage.deleteAsync(msg.key);
      break;

    case "get-selection": {
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.ui.postMessage({ type: "selection", data: null });
      } else {
        const data = inspectNode(selection[0]);
        if (selection.length > 1) {
          data.additionalCount = selection.length - 1;
        }
        figma.ui.postMessage({ type: "selection", data });
      }
      break;
    }

    default:
      break;
  }
};

// Notify UI that main thread is ready
figma.ui.postMessage({ type: "ready" });
