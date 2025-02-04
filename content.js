console.log("[Xterium] Content script loaded.");
window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data || event.data.type !== "XTERIUM_REQUEST") return;

  console.log("[Xterium] Forwarding request to background:", event.data.action);
  chrome.runtime.sendMessage({ action: event.data.action });
});

const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);