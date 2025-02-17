import { Storage } from "@plasmohq/storage";

const storage = new Storage({
  area: "local",
  allCopied: true
});

console.log("[Xterium] Content script loaded.");

function injectScript() {
  if (document.getElementById("xterium-injected-script")) return;

  const script = document.createElement("script");
  script.id = "xterium-injected-script";
  script.src = chrome.runtime.getURL("injected.js");

  script.onload = function () {
    console.log("[Xterium] Injected script successfully loaded.");
    this.remove();
  };

  (document.head || document.documentElement).appendChild(script);
}

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

// Save balance when the page loads
saveBalanceToChromeStorage();

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

        console.log(`balance:for ${publicKey}`);
      });
      break;
    }

    case "XTERIUM_REQUEST": {
      console.log("[Xterium] Forwarding request to background:", event.data.action);
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

injectScript();
