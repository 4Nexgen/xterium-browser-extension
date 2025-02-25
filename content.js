import { ApiPromise, WsProvider } from "@polkadot/api";
import { Storage } from "@plasmohq/storage";
import { BalanceServices } from "../src/services/balance.service";
import { NetworkService } from "../src/services/network.service";
import { UserService } from "../src/services/user.service";
import { WalletService } from "../src/services/wallet.service";

const bgImageUrl = chrome.runtime.getURL("assets/covers/bg-inside.png");

function injectCSS() {
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --primary-color: #00B3FF;
      --secondary-color: #1E1E2F;
      --highlight-color: #FF005C;
      --text-color: #FFFFFF;
      --overlay-bg: rgba(0, 0, 0, 0.8);
    }

    .wallet-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--overlay-bg);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: 'Arial', sans-serif;
    }

    .wallet-container {
      background: url('image.png') center/cover no-repeat, var(--secondary-color);
      border-radius: 16px;
      padding: 24px;
      width: 420px;
      text-align: center;
      color: var(--text-color);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      animation: fadeIn 0.4s ease-in-out;
      border: 1px solid #333;
      position: relative;
    }

    .wallet-header {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
      color: var(--text-color);
    }

    .wallet-description {
      font-size: 16px;
      color: #B0B0B0;
      margin-bottom: 20px;
    }

    .wallet-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      max-height: 300px;
      padding-right: 8px;
    }

    .wallet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: background 0.3s;
      cursor: pointer;
    }

    .wallet-item:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .wallet-item span {
      font-size: 16px;
      font-weight: 500;
    }

    .wallet-item .token-value {
      font-size: 16px;
      font-weight: bold;
      color: var(--primary-color);
    }

    .wallet-button {
      padding: 12px;
      background: linear-gradient(135deg, var(--primary-color), #007ACC);
      color: var(--text-color);
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s ease;
      margin-top: 16px;
    }

    .wallet-button:hover {
      background: linear-gradient(135deg, #00D4FF, #0099CC);
    }

    .wallet-cancel-button {
      margin-top: 12px;
      padding: 12px;
      background: var(--highlight-color);
      color: var(--text-color);
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .wallet-cancel-button:hover {
      background: #FF3366;
    }

    /* Animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinner {
      border: 6px solid #444;
      border-top: 6px solid var(--primary-color);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
  `;
  document.head.appendChild(style);
}

const storage = new Storage({
  area: "local",
  allCopied: true
});

const walletService = new WalletService();
const balanceService = new BalanceServices(walletService);
const networkService = new NetworkService();
const userService = new UserService();

let api = null;
async function connectToRPC() {
  if (api && api.isConnected) {
    console.log("[Content.js] API already connected.");
    return api;
  }
  console.log("[Content.js] Connecting to RPC...");
  try {
    const data = await networkService.getNetwork();
    const wsUrl = data.rpc;
    const wsProvider = new WsProvider(wsUrl);
    api = await ApiPromise.create({ provider: wsProvider });
    console.log("[Content.js] API connected successfully.");
    return api;
  } catch (error) {
    console.error("[Content.js] Failed to connect to RPC:", error);
    throw new Error("RPC connection failed.");
  }
}

async function saveBalanceToChromeStorage() {
  try {
    const walletBalances = await storage.get("wallet_balances");
    if (!walletBalances) {
      console.log("[Content.js] No balances found in Plasmo Storage.");
      return;
    }
    const parsedBalances =
      typeof walletBalances === "string" ? JSON.parse(walletBalances) : walletBalances;

    console.log("[Content.js] Saving balances to Chrome Storage:", parsedBalances);
    chrome.storage.local.set({ wallet_balances: parsedBalances }, () => {
      console.log("[Content.js] Balance successfully saved in Chrome Storage.");
    });
  } catch (error) {
    console.error("[Content.js] Error saving balance to Chrome Storage:", error);
  }
}

async function syncTokenListToChromeStorage() {
  try {
    const tokenList = await storage.get("token_list");
    if (!tokenList) {
      console.log("[Content.js] No token_list found in Plasmo Storage.");
      return;
    }
    const parsedTokenList =
      typeof tokenList === "string" ? JSON.parse(tokenList) : tokenList;

   // console.log("[Content.js] Saving token_list to Chrome Storage:", parsedTokenList);
    chrome.storage.local.set({ token_list: parsedTokenList }, () => {
     // console.log("[Content.js] token_list saved in Chrome Storage.");
    });
  } catch (err) {
    console.error("[Content.js] Failed to sync token list:", err);
  }
}
saveBalanceToChromeStorage();
syncTokenListToChromeStorage();

function fixBalanceReverse(value, decimal) {
  return (Number(value) * Math.pow(10, decimal)).toFixed(0);
}

function formatWalletAddress(address) {
  if (address.length <= 10) return address;
  return address.slice(0, 6) + "........" + address.slice(-6);
}

window.addEventListener("message", async (event) => {
  if (!event.data || event.source !== window) return;

  switch (event.data.type) {
    case "XTERIUM_GET_BALANCE": {
      const publicKey = event.data.publicKey;
      chrome.storage.local.get("wallet_balances", (data) => {
        const balance =
          data.wallet_balances && data.wallet_balances[publicKey]
            ? data.wallet_balances[publicKey]
            : null;
        window.postMessage(
          {
            type: "XTERIUM_BALANCE_RESPONSE",
            publicKey,
            balance
          },
          "*"
        );
        console.log(`[Content.js] Balance returned for ${publicKey}`);
      });
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
    case "XTERIUM_GET_TOKEN_LIST": {
      chrome.storage.local.get("token_list", (data) => {
        const tokenList = data.token_list || [];
        window.postMessage(
          {
            type: "XTERIUM_TOKEN_LIST_RESPONSE",
            tokenList
          },
          "*"
        );
      });
      break;
    }
    case "XTERIUM_GET_ESTIMATE_FEE": {
      const { owner, value, recipient, balance } = event.data;
      try {
        const apiInstance = await connectToRPC();
        const amount = BigInt(value);
        let info;
        if (balance.token.type === "Native") {
          info = await apiInstance.tx.balances.transfer(recipient, amount).paymentInfo(owner);
        } else if (balance.token.type === "Asset") {
          info = await apiInstance.tx.assets.transfer(balance.token.network_id, recipient, amount).paymentInfo(owner);
        } else {
          throw new Error("Unsupported token type.");
        }
        const substrateFee = {
          feeClass: info.class.toString(),
          weight: info.weight.toString(),
          partialFee: info.partialFee.toString()
        };
        window.postMessage(
          {
            type: "XTERIUM_ESTIMATE_FEE_RESPONSE",
            owner,
            substrateFee
          },
          "*"
        );
      } catch (error) {
        window.postMessage(
          {
            type: "XTERIUM_ESTIMATE_FEE_RESPONSE",
            owner,
            error: error.message
          },
          "*"
        );
      }
      break;
    }
    case "XTERIUM_TRANSFER_REQUEST": {
      const { token, owner, recipient, value, password } = event.data.payload;
      let storedPassword;
      try {
        storedPassword = await userService.getWalletPassword();
        if (!storedPassword) {
          window.postMessage(
            {
              type: "XTERIUM_TRANSFER_RESPONSE",
              error: "Incorrect password."
            },
            "*"
          );
          break;
        }
      } catch (err) {
        window.postMessage(
          {
            type: "XTERIUM_TRANSFER_RESPONSE",
            error: "Error accessing stored password: " + err
          },
          "*"
        );
        break;
      }
      const smallestUnitValue = fixBalanceReverse(value, 12);
      console.log("[Content.js] Converted value:", value, "->", smallestUnitValue);

      if (token.type === "Native") {
        balanceService
          .transfer(owner, Number(smallestUnitValue), recipient, storedPassword)
          .then((result) => {
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_RESPONSE",
                response: result
              },
              "*"
            );
          })
          .catch((error) => {
            console.error("[Content.js] Native transfer failed:", error);
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_RESPONSE",
                error: error.toString()
              },
              "*"
            );
          });
      } else if (token.type === "Asset") {
        balanceService
          .transferAssets(
            owner,
            token.network_id,
            Number(smallestUnitValue),
            recipient,
            storedPassword
          )
          .then((result) => {
            console.log("[Content.js] Asset transfer processed successfully:", result);
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_RESPONSE",
                response: result
              },
              "*"
            );
          })
          .catch((error) => {
            console.error("[Content.js] Asset transfer failed:", error);
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_RESPONSE",
                error: error.toString()
              },
              "*"
            );
          });
      } else {
        window.postMessage(
          {
            type: "XTERIUM_TRANSFER_RESPONSE",
            error: "Unknown token type."
          },
          "*"
        );
      }
      break;
    }
    case "XTERIUM_REFRESH_BALANCE": {
      const publicKey = event.data.publicKey;
      console.log(`[Content.js] Refreshing balances for wallet: ${publicKey}`);
      try {
        await connectToRPC();
        let tokenList = await storage.get("token_list");
        if (!tokenList) tokenList = [];
        if (typeof tokenList === "string") tokenList = JSON.parse(tokenList);
    
        const updatedBalances = [];
        for (const token of tokenList) {
          const balance = await balanceService.getBalancePerToken(publicKey, token);
          updatedBalances.push({
            tokenName: token.symbol,
            freeBalance: balance.freeBalance,
            reservedBalance: balance.reservedBalance,
            is_frozen: balance.is_frozen
          });
        }
        await balanceService.saveBalance(publicKey, updatedBalances);
        const walletBalances = JSON.parse(await storage.get("wallet_balances") || "{}");
        walletBalances[publicKey] = updatedBalances;
        await storage.set("wallet_balances", walletBalances);
    
        console.log("[Content.js] Balances updated successfully");
      } catch (error) {
        console.error("[Content.js] Error refreshing balances:", error);
      }
      break;
    }
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
    injectCSS();
  };
  (document.head || document.documentElement).appendChild(script);
}

injectScript();
