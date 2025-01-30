// Injected script
console.log("Injected script loaded");

window.xterium = {
  getWallets: () => {
    return new Promise((resolve, reject) => {
      console.log("Injected script: Sending request for wallets...");
      window.postMessage({ type: "XTERIUM_GET_WALLETS" }, "*");

      const listener = (event) => {
        console.log("Injected script: Received event:", event);
        if (event.source !== window || !event.data.type) return;

        if (event.data.type === "XTERIUM_WALLETS_RESPONSE") {
          window.removeEventListener("message", listener);
          console.log("Injected script: Received wallets response:", event.data.wallets);

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.wallets);
          }
        }
      };

      window.addEventListener("message", listener);
    });
  },

  openPopup: () => {
    console.log("Injected script: Opening Xterium popup...");
    // This will send a message to the background script
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
  },
};

// Log the xterium object to verify its structure
console.log("window.xterium:", window.xterium);