const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.onload = function () {
  this.remove(); // Remove the script after execution
};
(document.head || document.documentElement).appendChild(script);
