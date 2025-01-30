import { Storage } from "@plasmohq/storage";
const storage = new Storage({ area: "local", allCopied: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background: Received message:", message);

  if (message.type === "XTERIUM_REQUEST") {
    console.log("Background: Fetching wallets from storage...");

    storage
      .get("wallets") 
      .then((wallets) => {
        console.log("Background: Retrieved wallets from storage:", wallets);

        const parsedWallets = wallets ? JSON.parse(wallets) : [];

        sendResponse({ wallets: parsedWallets });
      })
      .catch((error) => {
        console.error("Background: Error retrieving wallets:", error);
        sendResponse({ error: "Failed to retrieve wallets" });
      });

    return true; 
  }
});
