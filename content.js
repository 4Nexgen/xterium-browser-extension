// content.js

// Inject the injected.js script into the current web page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');

script.onload = function () {
  this.remove(); // Clean up after loading
};

// Append the script to the document head or document element to execute it
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected script
window.addEventListener("message", (event) => {
  // Ensure the message is coming from the correct source
  if (event.source !== window || !event.data.type) return;

  // Check if the message is requesting wallets
  if (event.data.type === "XTERIUM_GET_WALLETS") {
    // Send a message to the background script to request wallets
    chrome.runtime.sendMessage({ type: "XTERIUM_REQUEST" }, (response) => {
      // Send the response back to the injected script
      window.postMessage({ type: "XTERIUM_WALLETS_RESPONSE", wallets: response.wallets }, "*");
    });
  }
});