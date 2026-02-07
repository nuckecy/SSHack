// Main thread — runs in Figma's sandbox
// Has access to Figma API but NO DOM, NO fetch, NO browser APIs

figma.showUI(__html__, {
  width: 670,
  height: 640,
  themeColors: true,
});

// Listen for messages from the UI thread
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

    case "get-selection":
      // Future: send selected layer properties to UI for context-aware responses
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
            width: "width" in node ? node.width : undefined,
            height: "height" in node ? node.height : undefined,
          },
        });
      }
      break;

    default:
      break;
  }
};

// Notify UI that main thread is ready
figma.ui.postMessage({ type: "ready" });
