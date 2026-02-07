"use strict";
(() => {
  // src/code.ts
  figma.showUI(__html__, {
    width: 670,
    height: 640,
    themeColors: true
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
      case "get-selection":
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
          figma.ui.postMessage({ type: "selection", data: null });
        } else {
          const node = selection[0];
          figma.ui.postMessage({
            type: "selection",
            data: {
              id: node.id,
              name: node.name,
              type: node.type,
              width: "width" in node ? node.width : void 0,
              height: "height" in node ? node.height : void 0
            }
          });
        }
        break;
      default:
        break;
    }
  };
  figma.ui.postMessage({ type: "ready" });
})();
