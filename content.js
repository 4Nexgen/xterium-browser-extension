console.log("[Xterium] Content script loaded.");
window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data || event.data.type !== "XTERIUM_REQUEST") {
    return;
  }

  console.log("[Xterium] Forwarding request to background:", event.data.action);
  
  chrome.runtime.sendMessage({ action: event.data.action }, (response) => {
    window.postMessage({ type: "XTERIUM_RESPONSE", public_key: response?.public_key }, "*");
  });
});
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");

script.onload = function () {
  console.log("[Xterium] Injected script loaded");
  this.remove();
};

(document.head || document.documentElement).appendChild(script);
