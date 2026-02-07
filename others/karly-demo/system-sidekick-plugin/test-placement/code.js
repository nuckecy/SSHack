figma.showUI(__html__, { width: 400, height: 500 });

figma.ui.onmessage = async (msg) => {

  if (msg.type === 'extract-keys') {
    try {
      const selection = figma.currentPage.selection;

      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'keys-result',
          text: 'Nothing selected. Select one or more components first.'
        });
        return;
      }

      var lines = [];

      for (var i = 0; i < selection.length; i++) {
        var node = selection[i];
        try {
          lines.push('Name: ' + node.name);
          lines.push('Type: ' + node.type);
          lines.push('ID: ' + node.id);

          if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
            lines.push('KEY: ' + node.key);
          } else if (node.type === 'INSTANCE') {
            lines.push('(Instance - getting main component...)');
            try {
              var main = await node.getMainComponentAsync();
              if (main) {
                lines.push('Main component: ' + main.name);
                lines.push('KEY: ' + main.key);
              } else {
                lines.push('Could not find main component');
              }
            } catch (e) {
              lines.push('Error getting main: ' + String(e));
            }
          } else {
            lines.push('(Not a component - try selecting the actual component, not a frame)');
          }
          lines.push('---');
        } catch (e) {
          lines.push('Error reading node: ' + String(e));
          lines.push('---');
        }
      }

      figma.ui.postMessage({
        type: 'keys-result',
        text: lines.join('\n')
      });
    } catch (e) {
      figma.ui.postMessage({
        type: 'keys-result',
        text: 'Error: ' + String(e)
      });
    }
  }

  if (msg.type === 'test-placement') {
    try {
      var key = msg.key;
      if (!key) {
        figma.ui.postMessage({ type: 'result', cls: 'error', text: 'Enter a key first' });
        return;
      }

      var component = await figma.importComponentByKeyAsync(key);
      var instance = component.createInstance();

      instance.x = figma.viewport.center.x - instance.width / 2;
      instance.y = figma.viewport.center.y - instance.height / 2;

      figma.currentPage.selection = [instance];
      figma.viewport.scrollAndZoomIntoView([instance]);

      figma.ui.postMessage({ type: 'result', cls: 'success', text: 'Placed "' + component.name + '"' });
    } catch (e) {
      figma.ui.postMessage({ type: 'result', cls: 'error', text: 'Error: ' + String(e) });
    }
  }
};
