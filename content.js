import { Storage } from "@plasmohq/storage";

const storage = new Storage({
  area: "local",
  allCopied: true
});

// Save balances from Plasmo Storage to Chrome Storage (unchanged logic).
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

// NEW: Fetch the token list from extension storage and inject it into the page's localStorage
async function syncTokenListToPage() {
  try {
    const tokenList = await storage.get("token_list");
    if (!tokenList) {
      console.log("[Content.js] No token list found in extension storage.");
      return;
    }
    console.log("[Content.js] Found token_list in extension storage:", tokenList);

    // Inject a script into the page context that writes to window.localStorage
    const scriptContent = `
      (function() {
        // Write the token list into the page's localStorage
        window.localStorage.setItem("token_list", JSON.stringify(${tokenList}));
        console.log("[Content.js -> Injected Script] token_list stored in page localStorage.");
      })();
    `;
    const scriptElement = document.createElement("script");
    scriptElement.textContent = scriptContent;
    (document.head || document.documentElement).appendChild(scriptElement);
    scriptElement.remove();
  } catch (err) {
    console.error("[Content.js] Failed to sync token list:", err);
  }
}

// Call our two setup functions on load
saveBalanceToChromeStorage();
syncTokenListToPage();

// Listen for window messages (balance requests, wallet requests, transfers, etc.)
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

    // Listen for transfer requests from injected.js.
    case "XTERIUM_TRANSFER_REQUEST": {
      console.log("[Content.js] Transfer request received from injected.js:", event.data.payload);
      // Forward the transfer request to background.js.
      chrome.runtime.sendMessage(
        { action: "XTERIUM_TRANSFER", payload: event.data.payload },
        (response) => {
          console.log("[Content.js] Transfer response from background:", response);
          window.postMessage(
            { type: "XTERIUM_TRANSFER_RESPONSE", ...response },
            "*"
          );
        }
      );
      break;
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "XTERIUM_TRANSFER") {
    console.log("[Content.js] Transfer request received; this is now handled in background.js.");
    sendResponse({ error: "Transfer is handled in background.js." });
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
