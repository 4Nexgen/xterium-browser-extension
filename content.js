import { ApiPromise, WsProvider } from "@polkadot/api"

import { Storage } from "@plasmohq/storage"

import { BalanceServices } from "../src/services/balance.service"
import { NetworkService } from "../src/services/network.service"
import { UserService } from "../src/services/user.service"
import { WalletService } from "../src/services/wallet.service"
import { injectCSS } from "../ui"

const storage = new Storage({
  area: "local",
  allCopied: true
})

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
    const wsProvider = new WsProvider(wsUrl)
    api = await ApiPromise.create({ provider: wsProvider })
    return api
  } catch (error) {
    console.error("Failed to connect to RPC:", error)
    throw new Error("RPC connection failed.")
  }
}

async function saveBalanceToChromeStorage() {
  try {
    const walletBalances = await storage.get("wallet_balances")
    if (!walletBalances) {
      return
    }
    const parsedBalances =
      typeof walletBalances === "string" ? JSON.parse(walletBalances) : walletBalances

    chrome.storage.local.set({ wallet_balances: parsedBalances }, () => {})
  } catch (error) {
    console.error("[Content.js] Error saving balance to Chrome Storage:", error)
  }
}

async function syncTokenListToChromeStorage() {
  try {
    const tokenList = await storage.get("token_list")
    if (!tokenList) {
      return
    }
    const parsedTokenList =
      typeof tokenList === "string" ? JSON.parse(tokenList) : tokenList
    chrome.storage.local.set({ token_list: parsedTokenList }, () => {})
  } catch (err) {
    console.error("[Content.js] Failed to sync token list:", err)
  }
}

saveBalanceToChromeStorage()
syncTokenListToChromeStorage()

window.addEventListener("message", async (event) => {
  if (!event.data || event.source !== window) return

  switch (event.data.type) {
    case "XTERIUM_GET_PASSWORD": {
      try {
        const decryptedPassword = await userService.getWalletPassword()
        window.postMessage(
          {
            type: "XTERIUM_PASSWORD_RESPONSE",
            password: decryptedPassword
          },
          "*"
        )
      } catch (error) {
        console.error("[Content.js] Error fetching stored password:", error)
        window.postMessage(
          {
            type: "XTERIUM_PASSWORD_RESPONSE",
            password: null
          },
          "*"
        )
      }
      break
    }
    default:
      break
  }
})
window.addEventListener("message", async (event) => {
  if (!event.data || event.source !== window) return

  switch (event.data.type) {
    case "XTERIUM_GET_BALANCE": {
      const publicKey = event.data.publicKey
      chrome.storage.local.get("wallet_balances", (data) => {
        const balance =
          data.wallet_balances && data.wallet_balances[publicKey]
            ? data.wallet_balances[publicKey]
            : null
        window.postMessage(
          {
            type: "XTERIUM_BALANCE_RESPONSE",
            publicKey,
            balance
          },
          "*"
        )
      })
      break
    }
    case "XTERIUM_GET_WALLETS": {
      chrome.storage.local.get("wallets", (data) => {
        window.postMessage(
          {
            type: "XTERIUM_WALLETS_RESPONSE",
            wallets: data.wallets || []
          },
          "*"
        )
      })
      break
    }
    case "XTERIUM_GET_TOKEN_LIST": {
      chrome.storage.local.get("token_list", (data) => {
        let tokenList = data.token_list || []
        if (typeof tokenList === "string") {
          try {
            tokenList = JSON.parse(tokenList)
          } catch (error) {
            console.error("Error parsing token_list:", error)
          }
        }
        window.postMessage(
          {
            type: "XTERIUM_TOKEN_LIST_RESPONSE",
            tokenList
          },
          "*"
        )
      })
      break
    }
    case "XTERIUM_GET_ESTIMATE_FEE": {
      const { owner, value, recipient, balance } = event.data
      try {
        if (!balance.token.type) {
          console.warn("Token type missing! Setting default type.")
          balance.token.type = "Native"
        }

        const apiInstance = await connectToRPC()
        const amount = BigInt(value)
        let info

        if (balance.token.type === "Native") {
          info = await apiInstance.tx.balances
            .transfer(recipient, amount)
            .paymentInfo(owner)
        } else if (balance.token.type === "Asset") {
          info = await apiInstance.tx.assets
            .transfer(balance.token.network_id, recipient, amount)
            .paymentInfo(owner)
        } else {
          throw new Error("Unsupported token type.")
        }

        const partialFee = BigInt(info.partialFee.toString())
        const formattedFee =
          (partialFee / BigInt(10 ** 12)).toString() +
          "." +
          (partialFee % BigInt(10 ** 12)).toString().padStart(12, "0")

        const substrateFee = {
          feeClass: info.class.toString(),
          weight: info.weight.toString(),
          partialFee: formattedFee
        }

        window.postMessage(
          {
            type: "XTERIUM_ESTIMATE_FEE_RESPONSE",
            owner,
            substrateFee
          },
          "*"
        )
      } catch (error) {
        window.postMessage(
          {
            type: "XTERIUM_ESTIMATE_FEE_RESPONSE",
            owner,
            error: error.message
          },
          "*"
        )
      }
      break
    }

    case "XTERIUM_TRANSFER_REQUEST": {
      const { token, owner, recipient, value } = event.data.payload
      let storedPassword
      try {
        storedPassword = await userService.getWalletPassword()
        if (!storedPassword) {
          window.postMessage(
            {
              type: "XTERIUM_TRANSFER_RESPONSE",
              error: "Incorrect password."
            },
            "*"
          )
          break
        }
      } catch (err) {
        window.postMessage(
          {
            type: "XTERIUM_TRANSFER_RESPONSE",
            error: "Error accessing stored password: " + err
          },
          "*"
        )
        break
      }

      const smallestUnitValue = value
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
            )
          })
          .catch((error) => {
            console.error("[Content.js] Transfer failed:", error)
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_RESPONSE",
                error: error.toString()
              },
              "*"
            )
          })
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
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_RESPONSE",
                response: result
              },
              "*"
            )
          })
          .catch((error) => {
            console.error("[Content.js] Transfer failed:", error)
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_RESPONSE",
                error: error.toString()
              },
              "*"
            )
          })
      } else {
        window.postMessage(
          {
            type: "XTERIUM_TRANSFER_RESPONSE",
            error: "Unknown token type."
          },
          "*"
        )
      }
      break
    }
    case "XTERIUM_REFRESH_BALANCE": {
      const { publicKey, token } = event.data
      try {
        const updatedBalance = await balanceService.getBalancePerToken(publicKey, token)

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
