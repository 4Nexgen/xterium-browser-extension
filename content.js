import { Storage } from "@plasmohq/storage";
import { WalletService } from "./wallet.service";
import { BalanceServices } from "./balance.service";

const storage = new Storage({
  area: "local",
  allCopied: true
});

// Create instances of WalletService and BalanceServices.
// BalanceServices requires a WalletService instance.
const walletService = new WalletService();
const balanceService = new BalanceServices(walletService);

console.log("[Xterium] Content script loaded.");

async function saveBalanceToChromeStorage() {
  try {
    const walletBalances = await storage.get("wallet_balances");

    if (!walletBalances) {
      console.log("[Content.js] No balances found in Plasmo Storage.");
      return;
    }

    let parsedBalances =
      typeof walletBalances === "string"
        ? JSON.parse(walletBalances)
        : walletBalances;

    console.log("[Content.js] Saving balances to Chrome Storage:", parsedBalances);

    chrome.storage.local.set({ wallet_balances: parsedBalances }, () => {
      console.log("[Content.js] Balance successfully saved in Chrome Storage.");
    });
  } catch (error) {
    console.error("[Content.js] Error saving balance to Chrome Storage:", error);
  }
}

// Save balance when the page loads.
saveBalanceToChromeStorage();

// Listen for window messages (e.g. for balance or wallet requests).
window.addEventListener("message", async (event) => {
  if (!event.data || event.source !== window) return;

  switch (event.data.type) {
    case "XTERIUM_GET_BALANCE": {
      const publicKey = event.data.publicKey;
      chrome.storage.local.get("wallet_balances", (data) => {
        if (!data.wallet_balances || !data.wallet_balances[publicKey]) {
          window.postMessage(
            {
              type: "XTERIUM_BALANCE_RESPONSE",
              publicKey: publicKey,
              balance: null
            },
            "*"
          );
          return;
        }
        const balance = data.wallet_balances[publicKey];
        window.postMessage(
          {
            type: "XTERIUM_BALANCE_RESPONSE",
            publicKey: publicKey,
            balance: balance
          },
          "*"
        );
        console.log(`[Content.js] Balance returned for ${publicKey}`);
      });
      break;
    }

    case "XTERIUM_REQUEST": {
      console.log("[Content.js] Forwarding request to background:", event.data.action);
      chrome.runtime.sendMessage({ action: event.data.action });
      break;
    }

    case "XTERIUM_GET_WALLETS": {
      chrome.storage.local.get("wallets", (data) => {
        window.postMessage(
          {
            type: "XTERIUM_WALLETS_RESPONSE",
            wallets: data.wallets || []
          },
          "*"
        );
      });
      break;
    }
  }
});

// Listen for transfer requests coming from injected.js via the runtime messaging API.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "XTERIUM_TRANSFER") {
    const { token, owner, recipient, value, password } = message.payload;
    // Basic payload validation.
    if (!token || !owner || !recipient || !value || !password) {
      sendResponse({ error: "Invalid payload for transfer." });
      return;
    }

    console.log(
      `[Content.js] Received transfer request: ${value} of ${token.symbol} from ${owner} to ${recipient}`
    );

    // Call the appropriate transfer method based on token type.
    if (token.type === "Native") {
      balanceService
        .transfer(owner, value, recipient, password)
        .then((result) => {
          console.log("[Content.js] Native transfer successful:", result);
          sendResponse({ success: true, result: result });
        })
        .catch((error) => {
          console.error("[Content.js] Native transfer failed:", error);
          sendResponse({ error: error });
        });
    } else if (token.type === "Asset") {
      balanceService
        .transferAssets(owner, token.network_id, value, recipient, password)
        .then((result) => {
          console.log("[Content.js] Asset transfer successful:", result);
          sendResponse({ success: true, result: result });
        })
        .catch((error) => {
          console.error("[Content.js] Asset transfer failed:", error);
          sendResponse({ error: error });
        });
    } else {
      sendResponse({ error: "Unknown token type." });
    }
    // Return true to indicate we will respond asynchronously.
    return true;
  }
});

function injectScript() {
  if (document.getElementById("xterium-injected-script")) return;

  const script = document.createElement("script");
  script.id = "xterium-injected-script";
  script.src = chrome.runtime.getURL("injected.js");

  script.onload = function () {
    console.log("[Content.js] Injected script successfully loaded.");
    this.remove();
  };

  (document.head || document.documentElement).appendChild(script);
}

injectScript();
