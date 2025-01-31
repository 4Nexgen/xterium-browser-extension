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

async function fetchWalletsAndBalances() {
  try {
      const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
              { type: "XTERIUM_REQUEST", method: "getWallets" },
              (response) => {
                  if (response.result) {
                      resolve(response.result);
                  } else {
                      reject(response.error || "Error fetching wallets.");
                  }
              }
          );
      });


      for (let wallet of response) {
          const publicKey = wallet.public_key;
          try {
              const balance = await window.xterium.getBalances(publicKey);
              console.log(`Balance for ${publicKey}:`, balance);
          } catch (error) {
              console.error("Error fetching balance:", error);
          }
      }
  } catch (error) {
      console.error("Error fetching wallets:", error);
  }
}

// Call the function to fetch wallets and balances
fetchWalletsAndBalances();

(document.head || document.documentElement).appendChild(script);
