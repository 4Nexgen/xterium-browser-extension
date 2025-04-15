import { BalanceServices } from "../src/services/balance.service"
import { NetworkService } from "../src/services/network.service"
import { TokenService } from "../src/services/token.service"
import { UserService } from "../src/services/user.service"
import { WalletService } from "../src/services/wallet.service"
import { injectCSS } from "../ui"

const walletService = new WalletService()
const balanceService = new BalanceServices(walletService)
const networkService = new NetworkService()
const userService = new UserService()

let api = null
async function connectToRPC() {
  if (api && api.isConnected) {
    return api
  }
  console.log("Connecting to RPC...")
  try {
    const data = await networkService.getNetwork()
    const wsUrl = data.rpc
    api = await networkService.connectRPC(wsUrl)
    return api
  } catch (error) {
    console.error("Failed to connect to RPC:", error)
    throw new Error("RPC connection failed.")
  }
}

function fixBalance(balance, decimals) {
  return (balance / Math.pow(10, decimals)).toFixed(12)
}

window.addEventListener("message", async (event) => {
  if (!event.data || event.source !== window) return

  switch (event.data.type) {
    case "XTERIUM_GET_PASSWORD": {
      try {
        const password = event.data.password
        const isPasswordStored = await userService.login(password)

        console.log("🔑 Input Password:", password)
        console.log("✅ Password Match:", isPasswordStored)

        window.postMessage(
          {
            type: "XTERIUM_PASSWORD_RESPONSE",
            isAuthenticated: isPasswordStored
          },
          "*"
        )
      } catch (error) {
        console.error("[Content.js] Error fetching stored password:", error)
        window.postMessage(
          {
            type: "XTERIUM_PASSWORD_RESPONSE",
            isAuthenticated: false,
            error: error.message
          },
          "*"
        )
      }
      break
    }
    case "XTERIUM_GET_WALLETS": {
      try {
        const wallets = await walletService.getWallets()
        window.postMessage(
          {
            type: "XTERIUM_WALLETS_RESPONSE",
            wallets: wallets || []
          },
          "*"
        )
      } catch (error) {
        console.error("Error fetching wallets:", error)
        window.postMessage(
          {
            type: "XTERIUM_WALLETS_RESPONSE",
            wallets: [],
            error: error.message
          },
          "*"
        )
      }
      break
    }
    case "XTERIUM_GET_TOKEN_LIST": {
      try {
        const apiInstance = await connectToRPC()
        const network = await networkService.getNetwork()
        const tokenService = new TokenService()
        const tokenList = await tokenService.getTokens(network, apiInstance)

        if (!Array.isArray(tokenList)) {
          throw new Error("Token list is not an array")
        }

        const validTokens = tokenList.filter(
          (t) =>
            t && t.type && t.symbol && (t.type === "Native" || t.token_id !== undefined)
        )

        window.postMessage(
          {
            type: "XTERIUM_TOKEN_LIST_RESPONSE",
            tokenList: validTokens
          },
          "*"
        )
      } catch (error) {
        console.error("Error fetching token list:", error)
        window.postMessage(
          {
            type: "XTERIUM_TOKEN_LIST_RESPONSE",
            tokenList: [],
            error: error.message
          },
          "*"
        )
      }
      break
    }
    case "XTERIUM_GET_ALL_BALANCES": {
      const { publicKey } = event.data
      try {
        const apiInstance = await connectToRPC()
        const network = await networkService.getNetwork()
        const tokenService = new TokenService()
        const tokenList = await tokenService.getTokens(network, apiInstance)

        const balances = []

        for (const token of tokenList) {
          try {
            const balanceData = await balanceService.getBalanceWithoutCallback(
              apiInstance,
              token,
              publicKey
            )

            balances.push({
              token,
              freeBalance: fixBalance(balanceData.free, token.decimals),
              reservedBalance: fixBalance(balanceData.reserved, token.decimals),
              status: balanceData.status,
              isFrozen: balanceData.status === "Frozen"
            })
          } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error)
            balances.push({
              token,
              freeBalance: 0,
              reservedBalance: 0,
              status: "error",
              isFrozen: false
            })
          }
        }

        window.postMessage(
          {
            type: "XTERIUM_ALL_BALANCES_RESPONSE",
            publicKey,
            balances
          },
          "*"
        )
      } catch (error) {
        console.error("Error fetching all balances:", error)
        window.postMessage(
          {
            type: "XTERIUM_ALL_BALANCES_RESPONSE",
            publicKey,
            error: error.message,
            balances: []
          },
          "*"
        )
      }
      break
    }
    case "XTERIUM_GET_ESTIMATE_FEE": {
      const { owner, value, recipient, balance } = event.data
      const token = balance.token
    
      try {
        const apiInstance = await connectToRPC()
        console.log("Connected to RPC successfully.")
    
        const fee = await balanceService.getEstimateTransferFee(
          apiInstance,
          token,
          owner,
          recipient,
          Number(value)
        )
        window.postMessage(
          {
            type: "XTERIUM_ESTIMATE_FEE_RESPONSE",
            substrateFee: { partialFee: fee },
            owner
          },
          "*"
        )
    
      } catch (error) {
        console.error("Error estimating fee:", error)

        window.postMessage(
          {
            type: "XTERIUM_ESTIMATE_FEE_RESPONSE",
            error: error.message,
            owner
          },
          "*"
        )
      }
      break
    }
    case "XTERIUM_TRANSFER_REQUEST": {
      const { token, owner, recipient, value, password } = event.data.payload;
    
      try {
        if (!token || !token.type) {
          throw new Error("Invalid token data");
        }
    
        const apiInstance = await connectToRPC();
    
        const result = await new Promise<ISubmittableResult>((resolve, reject) => {
          balanceService.transfer(
            apiInstance,
            token,
            owner,
            recipient,
            Number(value),
            (result) => {
              console.log("[Transfer] Received result:", result);
    
              if (result.status.isFinalized || result.status.isInBlock) {
                resolve(result);
              }
    
              // Optionally reject on failure
              if (result.isError || result.status.isInvalid) {
                reject(new Error("Transaction failed or invalid"));
              }
            }
          );
        });
    
        // ✅ Post the response after it's resolved
        window.postMessage(
          {
            type: "XTERIUM_TRANSFER_RESPONSE",
            response: {
              status: result.status.type,
              isFinalized: result.isFinalized,
              isInBlock: result.isInBlock,
              blockHash: result.status.isFinalized
                ? result.status.asFinalized?.toString?.() ?? null
                : null,
            },
          },
          "*"
        );
    
      } catch (error) {
        console.error("[Content.js] Transfer failed:", error);
        window.postMessage(
          {
            type: "XTERIUM_TRANSFER_RESPONSE",
            error: error.toString(),
          },
          "*"
        );
      }
    
      break;
    }
    case "XTERIUM_REFRESH_BALANCE": {
      const { publicKey, token } = event.data
      try {
        const apiInstance = await connectToRPC()
        const updatedBalance = await balanceService.getBalanceWithoutCallback(
          apiInstance,
          token,
          publicKey
        )

        window.postMessage(
          {
            type: "XTERIUM_UPDATED_BALANCE",
            balance: updatedBalance
          },
          "*"
        )
      } catch (error) {
        console.error(`Balance refresh failed for ${token.symbol}:`, error)
      }
      break
    }
    default:
      break
  }
})

function injectScript() {
  if (document.getElementById("xterium-injected-script")) return
  const script = document.createElement("script")
  script.id = "xterium-injected-script"
  script.src = chrome.runtime.getURL("injected.js")
  script.onload = function () {
    this.remove()
    injectCSS()
  }
  ;(document.head || document.documentElement).appendChild(script)
}

injectScript()
