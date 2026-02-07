"use strict";
(() => {
  // src/code.ts
  figma.showUI(__html__, {
    width: 420,
    height: 640,
    themeColors: true
  });
  function rgbToHex(r, g, b) {
    const to8 = (v) => Math.round(v * 255);
    const hex = (v) => to8(v).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
  }
  function serializePaints(paints) {
    if (paints === figma.mixed) return [];
    return paints.map((p) => {
      var _a;
      const base = {
        type: p.type,
        visible: p.visible !== false,
        opacity: (_a = p.opacity) != null ? _a : 1
      };
      if (p.type === "SOLID") {
        const c = p.color;
        base.color = rgbToHex(c.r, c.g, c.b);
        const opacityPct = Math.round(base.opacity * 100);
        base.display = `${base.color} ${opacityPct}%`;
      }
      return base;
    });
  }
  function countDescendants(node) {
    let count = 0;
    if ("children" in node) {
      for (const child of node.children) {
        count += 1 + countDescendants(child);
      }
    }
    return count;
  }
  function serializeChildren(children, depth, maxDepth = 3, maxPerLevel = 20) {
    if (depth >= maxDepth) return [];
    const limited = children.slice(0, maxPerLevel);
    return limited.map((child) => {
      const entry = {
        id: child.id,
        name: child.name,
        type: child.type,
        visible: child.visible
      };
      if ("width" in child) entry.width = Math.round(child.width);
      if ("height" in child) entry.height = Math.round(child.height);
      if (child.type === "TEXT") {
        entry.characters = child.characters;
      }
      if ("fills" in child) {
        entry.fills = serializePaints(child.fills);
      }
      if ("children" in child) {
        entry.children = serializeChildren(
          child.children,
          depth + 1,
          maxDepth,
          maxPerLevel
        );
      }
      return entry;
    });
  }
  function extractVariantProperties(node) {
    try {
      const props = node.componentProperties;
      if (!props || Object.keys(props).length === 0) return void 0;
      const result = {};
      for (const [key, val] of Object.entries(props)) {
        result[key] = String(val.value);
      }
      return result;
    } catch (e) {
      return void 0;
    }
  }
  function inspectNode(node) {
    var _a, _b;
    const data = {
      id: node.id,
      name: node.name,
      type: node.type,
      width: "width" in node ? Math.round(node.width) : 0,
      height: "height" in node ? Math.round(node.height) : 0,
      opacity: "opacity" in node ? node.opacity : 1,
      visible: node.visible,
      descendantCount: countDescendants(node),
      timestamp: Date.now()
    };
    if ("fills" in node) {
      data.fills = serializePaints(node.fills);
    }
    if ("strokes" in node) {
      data.strokes = serializePaints(node.strokes);
    }
    if ("strokeWeight" in node) {
      const sw = node.strokeWeight;
      data.strokeWeight = sw === figma.mixed ? "MIXED" : sw;
    }
    if ("cornerRadius" in node) {
      const cr = node.cornerRadius;
      data.cornerRadius = cr === figma.mixed ? "MIXED" : cr;
    }
    if ("layoutMode" in node) {
      const frame = node;
      if (frame.layoutMode !== "NONE") {
        data.autoLayout = {
          layoutMode: frame.layoutMode,
          itemSpacing: frame.itemSpacing,
          paddingTop: frame.paddingTop,
          paddingRight: frame.paddingRight,
          paddingBottom: frame.paddingBottom,
          paddingLeft: frame.paddingLeft,
          primaryAxisAlignItems: frame.primaryAxisAlignItems,
          counterAxisAlignItems: frame.counterAxisAlignItems
        };
      }
    }
    if (node.type === "TEXT") {
      const textNode = node;
      const fontSize = textNode.fontSize;
      const fontName = textNode.fontName;
      const lineHeight = textNode.lineHeight;
      const letterSpacing = textNode.letterSpacing;
      data.textProps = {
        characters: textNode.characters,
        fontSize: fontSize === figma.mixed ? "MIXED" : fontSize,
        fontName: fontName === figma.mixed ? "MIXED" : `${fontName.family} ${fontName.style}`,
        lineHeight: lineHeight === figma.mixed ? "MIXED" : (() => {
          const lh = lineHeight;
          if (lh.unit === "AUTO") return "AUTO";
          return `${lh.value}${lh.unit === "PERCENT" ? "%" : "px"}`;
        })(),
        letterSpacing: letterSpacing === figma.mixed ? "MIXED" : (() => {
          const ls = letterSpacing;
          return `${ls.value}${ls.unit === "PERCENT" ? "%" : "px"}`;
        })(),
        textAlignHorizontal: textNode.textAlignHorizontal,
        textAlignVertical: textNode.textAlignVertical
      };
    }
    if (node.type === "INSTANCE") {
      const instance = node;
      const main = instance.mainComponent;
      if (main) {
        data.componentInfo = {
          componentName: main.name,
          description: main.description || "",
          isRemote: main.remote,
          key: main.key,
          variantProperties: extractVariantProperties(instance),
          componentSetName: ((_a = main.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" ? main.parent.name : void 0
        };
      }
    } else if (node.type === "COMPONENT") {
      const comp = node;
      data.componentInfo = {
        componentName: comp.name,
        description: comp.description || "",
        isRemote: comp.remote,
        key: comp.key,
        componentSetName: ((_b = comp.parent) == null ? void 0 : _b.type) === "COMPONENT_SET" ? comp.parent.name : void 0
      };
    } else if (node.type === "COMPONENT_SET") {
      const set = node;
      data.componentInfo = {
        componentName: set.name,
        description: set.description || "",
        isRemote: set.remote,
        key: set.key
      };
    }
    if ("children" in node) {
      data.children = serializeChildren(
        node.children,
        0
      );
    }
    return data;
  }
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
  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case "resize":
        figma.ui.resize(msg.width, msg.height);
        break;
      case "notify":
        figma.notify(msg.message, { timeout: msg.timeout || 2e3 });
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
  figma.ui.postMessage({ type: "ready" });
})();
