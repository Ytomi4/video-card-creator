// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 600 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  if (msg.type === "get-mask-image") {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "フレームを選択してください。",
      });
      return;
    }
    const node = selection[0];
    if ("exportAsync" in node) {
      const bytes = await node.exportAsync({ format: "PNG" });
      figma.ui.postMessage({ type: "mask-image", data: bytes });
    } else {
      figma.ui.postMessage({
        type: "error",
        message: "選択したノードは画像として書き出せません。",
      });
    }
  }
};
