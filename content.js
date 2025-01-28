javascriptCopyEdit
script.src = chrome.runtime.getURL("injected.js"); // Path to your `injected.js` file
script.onload = function () {
  this.remove(); // Clean up after the script loads
};
(document.head || document.documentElement).appendChild(script);
