function formatWalletAddress(address) {
  if (address.length <= 10) return address // If address is too short, no need to truncate
  return address.slice(0, 6) + "........" + address.slice(-6)
}

if (!window.xterium) {
  console.log("[Injected.js] Script executed!")
  window.xterium = {
    extensionId: "jdljmhgiecpgbmellhlpdggmponadiln",
    isXterium: true,
    isConnected: false,
    connectedWallet: null,

    fixBalance: function (value, decimal = 12) {
      const multiplier = 10 ** decimal
      return parseFloat(value.toString()) / multiplier
    },

    loadConnectionState: function () {
      const savedConnectionState = localStorage.getItem("xterium_wallet_connection")
      if (savedConnectionState) {
        const connectionData = JSON.parse(savedConnectionState)
        this.isConnected = connectionData.isConnected
        this.connectedWallet = connectionData.connectedWallet
        console.log(
          "[Xterium] Wallet state loaded from localStorage:",
          this.connectedWallet
        )
      }
    },

    saveConnectionState: function () {
      const connectionData = {
        isConnected: this.isConnected,
        connectedWallet: this.connectedWallet
      }
      localStorage.setItem("xterium_wallet_connection", JSON.stringify(connectionData))
      console.log("[Xterium] Wallet state saved to localStorage.")
    },

    getWallets: function () {
      return new Promise((resolve, reject) => {
        if (this.isConnected && this.connectedWallet) {
          console.log(
            "[Xterium] Wallet already connected:",
            this.connectedWallet.public_key
          )
          resolve([this.connectedWallet.public_key])
        } else {
          window.postMessage({ type: "XTERIUM_GET_WALLETS" }, "*")

          const handleResponse = (event) => {
            if (
              event.source !== window ||
              !event.data ||
              event.data.type !== "XTERIUM_WALLETS_RESPONSE"
            )
              return
            window.removeEventListener("message", handleResponse)
            if (event.data.wallets) {
              let wallets = event.data.wallets
              try {
                if (typeof wallets === "string") {
                  wallets = JSON.parse(wallets)
                }
                if (typeof wallets === "string") {
                  wallets = JSON.parse(wallets)
                }
                if (!Array.isArray(wallets)) {
                  throw new Error("wallets is not an array after parsing")
                }
                if (wallets.length === 0) {
                  window.xterium.showPopup()
                  return reject("No wallets stored.")
                }
                window.xterium
                  .showConnectPrompt(wallets)
                  .then((wallet) => {
                    window.xterium.isConnected = true
                    window.xterium.connectedWallet = wallet
                    window.xterium.saveConnectionState()
                    resolve([wallet.public_key])
                  })
                  .catch((err) => {
                    reject(err)
                  })
              } catch (error) {
                console.error("[Injected.js] Error parsing wallets:", error)
                reject("Failed to parse wallets data.")
              }
            } else {
              reject("No wallets found.")
            }
          }

          window.addEventListener("message", handleResponse)
        }
      })
    },

    showConnectPrompt: function (wallets) {
      return new Promise((resolve, reject) => {
        const overlay = document.createElement("div")
        overlay.id = "wallet-connect-overlay"
        overlay.classList.add("wallet-overlay")

        const container = document.createElement("div")
        container.classList.add("wallet-container")

        const header = document.createElement("div")
        header.classList.add("wallet-header")
        header.innerText = "Connect Your Wallet"

        const description = document.createElement("p")
        description.classList.add("wallet-description")
        description.innerText = "Choose a wallet to proceed:"

        const walletList = document.createElement("div")
        walletList.classList.add("wallet-list")

        wallets.forEach((wallet) => {
          const walletButton = document.createElement("button")
          walletButton.classList.add("wallet-button")
          walletButton.innerText = formatWalletAddress(wallet.public_key)
          walletButton.addEventListener("click", () => {
            document.body.removeChild(overlay)
            window.xterium.showSuccessMessage(wallet)
            resolve(wallet)
          })
          walletList.appendChild(walletButton)
        })

        const cancelButton = document.createElement("button")
        cancelButton.classList.add("wallet-cancel-button")
        cancelButton.innerText = "Cancel"
        cancelButton.addEventListener("click", () => {
          document.body.removeChild(overlay)
          reject("User cancelled wallet connection.")
        })

        container.appendChild(header)
        container.appendChild(description)
        container.appendChild(walletList)
        container.appendChild(cancelButton)
        overlay.appendChild(container)
        document.body.appendChild(overlay)
      })
    },
    getBalance: function (publicKey) {
      return new Promise((resolve, reject) => {
        if (!window.xterium.isConnected || !window.xterium.connectedWallet) {
          console.error("[Injected.js] getBalance error: No wallet connected.")
          reject("No wallet connected.")
          return
        }
        if (window.xterium.connectedWallet.public_key !== publicKey) {
          console.error(
            "[Injected.js] getBalance error: Requested public key does not match the connected wallet."
          )
          reject("Not connected to that wallet.")
          return
        }
        console.log(`[Injected.js] Requesting balance for ${publicKey}`)
        const handleResponse = (event) => {
          if (
            event.source !== window ||
            !event.data ||
            event.data.type !== "XTERIUM_BALANCE_RESPONSE"
          )
            return
          if (event.data.publicKey !== publicKey) return
          window.removeEventListener("message", handleResponse)
          if (event.data.balance !== null) {
            try {
              let balanceData = event.data.balance
              // Parse the balance if it is a string
              if (typeof balanceData === "string") {
                balanceData = JSON.parse(balanceData)
              }
              let fixedBalance
              // If the balance is an array, map through each token balance
              if (Array.isArray(balanceData)) {
                fixedBalance = balanceData.map((item) => ({
                  tokenName: item.tokenName,
                  freeBalance: window.xterium.fixBalance(item.freeBalance, 12),
                  reservedBalance: window.xterium.fixBalance(item.reservedBalance, 12),
                  is_frozen: item.is_frozen
                }))
              }
              // If the balance is an object, convert it to an array of balance objects
              else if (typeof balanceData === "object") {
                fixedBalance = Object.keys(balanceData).map((token) => ({
                  tokenName: token,
                  freeBalance: window.xterium.fixBalance(
                    balanceData[token].freeBalance,
                    12
                  ),
                  reservedBalance: window.xterium.fixBalance(
                    balanceData[token].reservedBalance,
                    12
                  ),
                  is_frozen: balanceData[token].is_frozen
                }))
              } else {
                // If it's just a numeric value, apply fixBalance directly
                fixedBalance = window.xterium.fixBalance(balanceData, 12)
              }
              console.log(`[Injected.js] Balance for ${publicKey} (fixed):`, fixedBalance)
              resolve(fixedBalance)
            } catch (error) {
              console.error("[Injected.js] Error parsing balance response:", error)
              reject("Failed to parse balance data.")
            }
          } else {
            console.log(`[Injected.js] No balance found for ${publicKey}`)
            reject("No balance found.")
          }
        }
        window.addEventListener("message", handleResponse)
        console.log(`[Injected.js] Sending balance request for ${publicKey}`)
        window.postMessage({ type: "XTERIUM_GET_BALANCE", publicKey }, "*")
      })
    },
    transferInternal: function (token, recipient, value, password) {
      return new Promise((resolve, reject) => {
        if (!window.xterium.isConnected || !window.xterium.connectedWallet) {
          reject("No wallet connected. Please connect your wallet first.")
          return
        }

        if (!token) {
          reject("Token parameter is required.")
          return
        }
        if (!recipient || recipient.trim() === "") {
          reject("Recipient address is required.")
          return
        }
        if (!value || isNaN(value) || Number(value) <= 0) {
          reject("Transfer value must be a positive number.")
          return
        }
        if (!password) {
          reject("Password is required.")
          return
        }

        const owner = window.xterium.connectedWallet.public_key

        // Check balance before proceeding with the transfer
        window.xterium
          .getBalance(owner)
          .then((balances) => {
            const userBalance = balances.find((b) => b.tokenName === token.symbol)
            if (!userBalance || userBalance.freeBalance < Number(value)) {
              reject(
                `Insufficient balance. Your available balance is ${userBalance ? userBalance.freeBalance : 0} ${token.symbol}.`
              )
              return
            }

            console.log(
              `[Injected.js] Initiating transfer of ${value} ${token.symbol} from ${owner} to ${recipient}`
            )

            function handleTransferResponse(event) {
              if (event.source !== window || !event.data) return
              if (event.data.type === "XTERIUM_TRANSFER_RESPONSE") {
                window.removeEventListener("message", handleTransferResponse)
                if (event.data.error) {
                  reject(event.data.error)
                } else {
                  console.log(
                    "[Injected.js] Transfer successful. Fetching updated balance..."
                  )
                  window.xterium
                    .getBalance(owner)
                    .then((updatedBalance) => {
                      console.log("[Injected.js] Updated balance:", updatedBalance)
                      window.postMessage(
                        { type: "XTERIUM_REFRESH_BALANCE", publicKey: owner },
                        "*"
                      )
                      resolve(event.data.response)
                    })
                    .catch((balanceErr) => {
                      console.error(
                        "[Injected.js] Error fetching updated balance:",
                        balanceErr
                      )
                      reject(balanceErr)
                    })
                }
              }
            }

            window.addEventListener("message", handleTransferResponse)
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_REQUEST",
                payload: { token, owner, recipient, value, password }
              },
              "*"
            )
          })
          .catch((err) => {
            reject(`Failed to fetch balance: ${err}`)
          })
      })
    },
    transfer: function (token, recipient, value, password) {
      if (arguments.length === 0) {
        return window.xterium.showTransferUI()
      } else {
        let tokenSymbol = typeof token === "string" ? token.trim() : token.symbol
        let tokenObj = { symbol: tokenSymbol, type: "Native" }
        let detectedInfo = "Detected as: Native (default)"

        if (window._xteriumTokenData) {
          const foundToken = window._xteriumTokenData.find(
            (t) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase()
          )
          if (foundToken) {
            if (foundToken.type === "Asset") {
              detectedInfo = `Detected as: Asset on ${foundToken.network} (Network ID: ${foundToken.network_id})`
            } else {
              detectedInfo = `Detected as: Native${foundToken.network ? ` on ${foundToken.network}` : " (default)"}`
            }
            tokenObj = foundToken
          }
        }
        console.log("[Xterium] Detected token type:", detectedInfo)
        return window.xterium
          .getEstimateFee(
            window.xterium.connectedWallet.public_key,
            Number(value),
            recipient,
            { token: tokenObj }
          )
          .then((fee) => {
            const fixedFee = window.xterium.fixBalance(fee.partialFee, 12)
            console.log(`Estimated Fee: ${fixedFee}`)
            console.log("[Xterium] Transfer form submitted with values:", {
              token: tokenSymbol,
              recipient: recipient,
              value: value,
              password: "****",
              detected: detectedInfo
            })
            console.log("[Xterium] Final token object:", tokenObj)

            return window.xterium
              .transferInternal(tokenObj, recipient, Number(value), password)
              .then((res) => {
                console.log("[Xterium] Transfer successful:", res)
                // Update the transferring overlay to show the success animation.
                window.xterium.updateTransferringAnimationToSuccess(transferringOverlay)
                // Remove the transfer UI overlay (the one containing the form).
                document.body.removeChild(overlay)
                // Wait 3 seconds for the success animation, then resolve.
                setTimeout(() => {
                  resolve(res)
                }, 3000)
              })
          })
          .catch((err) => {
            console.error("Fee estimation or transfer error:", err)
            return Promise.reject(err)
          })
      }
    },
    showTransferringAnimation: function () {
      const overlay = document.createElement("div")
      overlay.id = "xterium-transferring-overlay"
      overlay.classList.add("transfer-animation-overlay")

      const container = document.createElement("div")
      container.classList.add("transfer-animation-container")

      const spinner = document.createElement("div")
      spinner.classList.add("spinner")
      container.appendChild(spinner)

      const text = document.createElement("div")
      text.innerText = "Transferring..."
      container.appendChild(text)

      overlay.appendChild(container)
      document.body.appendChild(overlay)
      return overlay
    },
    updateTransferringAnimationToSuccess: function (overlay) {
      overlay.innerHTML = ""

      const container = document.createElement("div")
      container.classList.add("transfer-animation-container")
      const checkContainer = document.createElement("div")
      checkContainer.classList.add("check-container")

      const checkMark = document.createElement("div")
      checkMark.classList.add("check-mark")
      checkMark.innerText = "✓"
      checkContainer.appendChild(checkMark)
      container.appendChild(checkContainer)

      const successText = document.createElement("div")
      successText.innerText = "Transfer Successful"
      container.appendChild(successText)

      overlay.appendChild(container)
    },

    showTransferUI: function () {
      return new Promise((resolve, reject) => {
        const createTransferUI = (tokenData) => {
          const overlay = document.createElement("div")
          overlay.id = "xterium-transfer-overlay"
          overlay.style.position = "fixed"
          overlay.style.top = "0"
          overlay.style.left = "0"
          overlay.style.width = "100%"
          overlay.style.height = "100%"
          overlay.style.backgroundColor = "rgba(0,0,0,0.5)"
          overlay.style.zIndex = "10000"
          overlay.style.display = "flex"
          overlay.style.justifyContent = "center"
          overlay.style.alignItems = "center"

          const container = document.createElement("div")
          container.style.backgroundColor = "#fff"
          container.style.padding = "20px"
          container.style.borderRadius = "8px"
          container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)"
          container.style.width = "300px"
          container.style.textAlign = "center"

          const title = document.createElement("h3")
          title.innerText = "Transfer Tokens"
          container.appendChild(title)

          const errorMsg = document.createElement("div")
          errorMsg.style.color = "red"
          errorMsg.style.marginBottom = "10px"
          errorMsg.style.display = "none"
          container.appendChild(errorMsg)

          const detectedInfo = document.createElement("div")
          detectedInfo.style.fontSize = "0.9em"
          detectedInfo.style.marginBottom = "10px"
          detectedInfo.style.color = "#333"
          detectedInfo.innerText = "Detected as: Native (default)"
          container.appendChild(detectedInfo)

          const feeDisplay = document.createElement("div")
          feeDisplay.style.color = "#555"
          feeDisplay.style.marginBottom = "10px"
          feeDisplay.innerText = "Estimated Fee: Calculating..."
          container.appendChild(feeDisplay)

          const form = document.createElement("form")
          form.id = "xterium-transfer-form"

          const tokenLabel = document.createElement("label")
          tokenLabel.innerText = "Token Symbol:"
          tokenLabel.style.display = "block"
          form.appendChild(tokenLabel)

          const tokenInput = document.createElement("input")
          tokenInput.type = "text"
          tokenInput.name = "token"
          tokenInput.required = true
          tokenInput.style.width = "100%"
          tokenInput.style.marginBottom = "10px"
          form.appendChild(tokenInput)

          const recipientLabel = document.createElement("label")
          recipientLabel.innerText = "Recipient:"
          recipientLabel.style.display = "block"
          form.appendChild(recipientLabel)

          const recipientInput = document.createElement("input")
          recipientInput.type = "text"
          recipientInput.name = "recipient"
          recipientInput.required = true
          recipientInput.style.width = "100%"
          recipientInput.style.marginBottom = "10px"
          form.appendChild(recipientInput)

          const valueLabel = document.createElement("label")
          valueLabel.innerText = "Value (smallest unit):"
          valueLabel.style.display = "block"
          form.appendChild(valueLabel)

          const valueInput = document.createElement("input")
          valueInput.type = "number"
          valueInput.name = "value"
          valueInput.required = true
          valueInput.style.width = "100%"
          valueInput.style.marginBottom = "10px"
          form.appendChild(valueInput)

          const passwordLabel = document.createElement("label")
          passwordLabel.innerText = "Password:"
          passwordLabel.style.display = "block"
          form.appendChild(passwordLabel)

          const passwordInput = document.createElement("input")
          passwordInput.type = "password"
          passwordInput.name = "password"
          passwordInput.required = true
          passwordInput.style.width = "100%"
          passwordInput.style.marginBottom = "10px"
          form.appendChild(passwordInput)

          const submitButton = document.createElement("button")
          submitButton.type = "submit"
          submitButton.innerText = "Transfer"
          submitButton.style.padding = "10px 15px"
          submitButton.style.backgroundColor = "#4CAF50"
          submitButton.style.color = "#fff"
          submitButton.style.border = "none"
          submitButton.style.borderRadius = "4px"
          submitButton.style.cursor = "pointer"
          form.appendChild(submitButton)

          const cancelButton = document.createElement("button")
          cancelButton.type = "button"
          cancelButton.innerText = "Cancel"
          cancelButton.style.padding = "10px 15px"
          cancelButton.style.backgroundColor = "#f44336"
          cancelButton.style.color = "#fff"
          cancelButton.style.border = "none"
          cancelButton.style.borderRadius = "4px"
          cancelButton.style.cursor = "pointer"
          cancelButton.style.marginLeft = "10px"
          cancelButton.addEventListener("click", () => {
            document.body.removeChild(overlay)
            reject("User cancelled transfer.")
          })
          form.appendChild(cancelButton)

          container.appendChild(form)
          overlay.appendChild(container)
          document.body.appendChild(overlay)

          console.log("[Xterium] Transfer UI shown.")

          let tokenDetectTimeout = null
          tokenInput.addEventListener("input", function () {
            clearTimeout(tokenDetectTimeout)
            tokenDetectTimeout = setTimeout(() => {
              detectTokenType(tokenInput.value.trim())
            }, 500)
          })

          function detectTokenType(tokenVal) {
            if (!tokenVal) {
              detectedInfo.innerText = "Detected as: Native (default)"
              return
            }
            if (!window._xteriumTokenData) {
              detectedInfo.innerText = "Detected as: Native (default)"
              return
            }
            const foundToken = window._xteriumTokenData.find(
              (t) => t.symbol.toUpperCase() === tokenVal.toUpperCase()
            )
            if (foundToken) {
              if (foundToken.type === "Asset") {
                detectedInfo.innerText = `Detected as: Asset on ${foundToken.network} (Network ID: ${foundToken.network_id})`
              } else {
                detectedInfo.innerText =
                  `Detected as: Native` +
                  (foundToken.network ? ` on ${foundToken.network}` : " (default)")
              }
            } else {
              detectedInfo.innerText = "Detected as: Native (default)"
            }
            console.log("[Xterium] Detected token type:", detectedInfo.innerText)
          }

          let feeTimeout = null
          tokenInput.addEventListener("input", updateEstimatedFee)
          recipientInput.addEventListener("input", updateEstimatedFee)
          valueInput.addEventListener("input", updateEstimatedFee)

          function updateEstimatedFee() {
            clearTimeout(feeTimeout)
            feeTimeout = setTimeout(async () => {
              const tokenSymbol = tokenInput.value.trim()
              const recipientVal = recipientInput.value.trim()
              const valueVal = valueInput.value.trim()
              if (!tokenSymbol || !recipientVal || !valueVal) {
                feeDisplay.innerText = "Estimated Fee: Enter details first..."
                return
              }
              let foundToken = window._xteriumTokenData.find(
                (t) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase()
              )
              let tokenObj = foundToken
                ? { ...foundToken }
                : { symbol: tokenSymbol, type: "Native" }
              try {
                const fee = await window.xterium.getEstimateFee(
                  window.xterium.connectedWallet.public_key,
                  Number(valueVal),
                  recipientVal,
                  { token: tokenObj }
                )
                const fixedFee = window.xterium.fixBalance(fee.partialFee, 12)
                feeDisplay.innerText = `Estimated Fee: ${fixedFee}`
              } catch (error) {
                console.error("[Xterium] Fee estimation error:", error)
                feeDisplay.innerText = "Error calculating fee"
              }
            }, 500)
          }

          // Form submission: first show the approval UI, then show the transferring overlay.
          form.addEventListener("submit", function (e) {
            e.preventDefault()
            errorMsg.style.display = "none"
            const tokenValue = tokenInput.value.trim()
            const recipientValue = recipientInput.value.trim()
            const valueValue = valueInput.value.trim()
            const passwordValue = passwordInput.value.trim()

            console.log("[Xterium] Transfer form submitted with values:", {
              token: tokenValue,
              recipient: recipientValue,
              value: valueValue,
              password: "****",
              detected: detectedInfo.innerText
            })
            let foundToken = window._xteriumTokenData.find(
              (t) => t.symbol.toUpperCase() === tokenValue.toUpperCase()
            )
            let tokenObj = foundToken
              ? { ...foundToken }
              : { symbol: tokenValue, type: "Native" }
            console.log("[Xterium] Final token object:", tokenObj)
            tokenInput.disabled = true
            recipientInput.disabled = true
            valueInput.disabled = true
            passwordInput.disabled = true
            submitButton.disabled = true
            cancelButton.disabled = true
            const feeText = feeDisplay.innerText.replace("Estimated Fee: ", "") || "N/A"
            window.xterium
              .showTransferApprovalUI({
                token: tokenObj,
                recipient: recipientValue,
                value: valueValue,
                fee: feeText
              })
              .then(() => {
                const transferringOverlay = window.xterium.showTransferringAnimation()
                window.xterium
                  .transferInternal(
                    tokenObj,
                    recipientValue,
                    Number(valueValue),
                    passwordValue
                  )
                  .then((res) => {
                    window.xterium.updateTransferringAnimationToSuccess(
                      transferringOverlay
                    )
                    console.log("[Xterium] Transfer successful:", res)
                    document.body.removeChild(overlay)
                    setTimeout(() => {
                      location.reload()
                    }, 3000)
                  })
                  .catch((err) => {
                    document.body.removeChild(transferringOverlay)
                    console.error("[Xterium] Transfer error:", err)
                    errorMsg.innerText = "Transfer error: " + err
                    errorMsg.style.display = "block"
                    tokenInput.disabled = false
                    recipientInput.disabled = false
                    valueInput.disabled = false
                    passwordInput.disabled = false
                    submitButton.disabled = false
                    cancelButton.disabled = false
                    reject(err)
                  })
              })
              .catch((err) => {
                tokenInput.disabled = false
                recipientInput.disabled = false
                valueInput.disabled = false
                passwordInput.disabled = false
                submitButton.disabled = false
                cancelButton.disabled = false
                errorMsg.innerText = "Transfer cancelled."
                errorMsg.style.display = "block"
                reject(err)
              })
          })
        } // End of createTransferUI

        window.postMessage({ type: "XTERIUM_GET_TOKEN_LIST" }, "*")
        const handleTokenListResponse = (event) => {
          if (event.source !== window || !event.data) return
          if (event.data.type !== "XTERIUM_TOKEN_LIST_RESPONSE") return
          window.removeEventListener("message", handleTokenListResponse)
          let tokenData = event.data.tokenList || []
          if (typeof tokenData === "string") {
            try {
              tokenData = JSON.parse(tokenData)
            } catch (error) {
              console.error("[Injected.js] Error parsing token list:", error)
              tokenData = []
            }
          }
          console.log("[Injected.js] Token list from extension storage:", tokenData)
          window._xteriumTokenData = tokenData
          createTransferUI(tokenData)
        }
        window.addEventListener("message", handleTokenListResponse)
      })
    },
    showSuccessMessage: function (wallet) {
      const animationOverlay = document.createElement("div")
      animationOverlay.id = "wallet-check-animation"
      animationOverlay.style.position = "fixed"
      animationOverlay.style.top = "0"
      animationOverlay.style.left = "0"
      animationOverlay.style.width = "100%"
      animationOverlay.style.height = "100%"
      animationOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
      animationOverlay.style.zIndex = "10000"
      animationOverlay.style.display = "flex"
      animationOverlay.style.justifyContent = "center"
      animationOverlay.style.alignItems = "center"

      const successContainer = document.createElement("div")
      successContainer.style.display = "flex"
      successContainer.style.flexDirection = "column"
      successContainer.style.alignItems = "center"
      successContainer.style.justifyContent = "center"
      successContainer.style.backgroundColor = "#1C3240" // Updated background color
      successContainer.style.borderRadius = "12px"
      successContainer.style.padding = "20px"
      successContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)"
      successContainer.style.opacity = "0"
      successContainer.style.transform = "scale(0.8)"

      const checkMark = document.createElement("div")
      checkMark.innerText = "✓"
      checkMark.style.color = "white"
      checkMark.style.fontSize = "50px"
      checkMark.style.fontWeight = "bold"
      checkMark.style.marginBottom = "10px"

      const connectedText = document.createElement("div")
      connectedText.innerText = "Wallet Connected"
      connectedText.style.color = "white"
      connectedText.style.fontSize = "20px"
      connectedText.style.fontWeight = "500"

      successContainer.appendChild(checkMark)
      successContainer.appendChild(connectedText)
      animationOverlay.appendChild(successContainer)
      document.body.appendChild(animationOverlay)
      successContainer.animate(
        [
          { opacity: 0, transform: "scale(0.8)" },
          { opacity: 1, transform: "scale(1)" },
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.2)" }
        ],
        {
          duration: 1500,
          easing: "ease-in-out"
        }
      ).onfinish = () => {
        if (document.body.contains(animationOverlay)) {
          document.body.removeChild(animationOverlay)
        }
      }

      console.log("Connected to wallet:", wallet.public_key)
    },

    disconnectWallet: function () {
      console.log("[Xterium] Disconnecting wallet...")
      window.xterium.isConnected = false
      window.xterium.connectedWallet = null
      const overlays = document.querySelectorAll(
        "#wallet-connect-overlay, #wallet-success-overlay, #send-receive-overlay"
      )
      overlays.forEach(
        (overlay) =>
          overlay && overlay.parentNode && overlay.parentNode.removeChild(overlay)
      )
      window.xterium.saveConnectionState()
      console.log("[Xterium] Wallet disconnected.")
    },

    getEstimateFee: async function (owner, value, recipient, balance) {
      return new Promise((resolve, reject) => {
        function handleFeeResponse(event) {
          if (event.source !== window || !event.data) return
          if (event.data.type !== "XTERIUM_ESTIMATE_FEE_RESPONSE") return
          if (event.data.owner !== owner) return
          window.removeEventListener("message", handleFeeResponse)
          if (event.data.error) {
            reject(event.data.error)
          } else {
            resolve(event.data.substrateFee)
          }
        }
        window.addEventListener("message", handleFeeResponse)
        window.postMessage(
          {
            type: "XTERIUM_GET_ESTIMATE_FEE",
            owner,
            value,
            recipient,
            balance
          },
          "*"
        )
      })
    },
    showPopup: function () {
      if (document.getElementById("xterium-popup-overlay")) return
      document.body.style.overflow = "auto"

      const overlay = document.createElement("div")
      overlay.id = "xterium-popup-overlay"
      overlay.style.position = "fixed"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.width = "100%"
      overlay.style.height = "100%"
      overlay.style.backgroundColor = "rgba(0,0,0,0.0)"
      overlay.style.zIndex = "10000"
      overlay.style.pointerEvents = "none"

      const container = document.createElement("div")
      container.style.position = "fixed"
      container.style.width = "450px"
      container.style.height = "600px"
      container.style.top = "50%"
      container.style.left = "50%"
      container.style.transform = "translate(-50%, -50%)"
      container.style.backgroundColor = "#fff"
      container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)"
      container.style.borderRadius = "8px"
      container.style.pointerEvents = "auto"
      container.style.overflow = "hidden"

      // Close button remains unchanged
      const closeBtn = document.createElement("button")
      closeBtn.innerText = "X"
      closeBtn.style.position = "absolute"
      closeBtn.style.top = "10px"
      closeBtn.style.right = "10px"
      closeBtn.style.cursor = "pointer"
      closeBtn.style.border = "none"
      closeBtn.style.background = "transparent"
      closeBtn.style.fontSize = "18px"
      closeBtn.style.color = "#333"
      closeBtn.style.zIndex = "2"
      closeBtn.addEventListener("click", () => {
        document.body.removeChild(overlay)
        document.body.style.overflow = ""
      })

      const iframe = document.createElement("iframe")
      iframe.src = `chrome-extension://${window.xterium.extensionId}/popup.html`
      iframe.style.width = "100%"
      iframe.style.height = "100%"
      iframe.style.border = "none"
      iframe.style.overflow = "hidden"

      const dragBar = document.createElement("div")
      dragBar.style.position = "absolute"
      dragBar.style.top = "0"
      dragBar.style.left = "50%"
      dragBar.style.transform = "translateX(-50%)"
      dragBar.style.width = "200px"
      dragBar.style.height = "30px"
      dragBar.style.cursor = "move"
      dragBar.style.background = "transparent"
      dragBar.style.zIndex = "1"

      let isDragging = false,
        startX,
        startY,
        origX,
        origY
      dragBar.addEventListener("mousedown", function (e) {
        isDragging = true
        const rect = container.getBoundingClientRect()
        // Remove centering transform so we work with pixel values
        container.style.left = rect.left + "px"
        container.style.top = rect.top + "px"
        container.style.transform = ""
        startX = e.clientX
        startY = e.clientY
        origX = rect.left
        origY = rect.top

        function onMouseMove(e) {
          if (!isDragging) return
          const dx = e.clientX - startX
          const dy = e.clientY - startY
          container.style.left = origX + dx + "px"
          container.style.top = origY + dy + "px"
        }

        function onMouseUp() {
          isDragging = false
          document.removeEventListener("mousemove", onMouseMove)
          document.removeEventListener("mouseup", onMouseUp)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
        e.preventDefault()
      })
      container.appendChild(iframe)
      container.appendChild(dragBar)
      container.appendChild(closeBtn)
      overlay.appendChild(container)
      document.body.appendChild(overlay)

      console.log("[Xterium] Popup overlay opened.")
    },
    showTransferApprovalUI: function (details) {
      return new Promise((resolve, reject) => {
        const overlay = document.createElement("div")
        overlay.id = "xterium-transfer-approval-overlay"
        overlay.style.position = "fixed"
        overlay.style.top = "0"
        overlay.style.left = "0"
        overlay.style.width = "100vw"
        overlay.style.height = "100vh"
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
        overlay.style.zIndex = "10000"
        overlay.style.display = "flex"
        overlay.style.justifyContent = "center"
        overlay.style.alignItems = "center"

        const container = document.createElement("div")
        container.style.backgroundColor = "#fff"
        container.style.padding = "20px"
        container.style.borderRadius = "8px"
        container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)"
        container.style.width = "300px"
        container.style.textAlign = "center"

        const title = document.createElement("h3")
        title.innerText = "Confirm Transfer"
        container.appendChild(title)

        // If sender is provided, display overlapping sender and recipient addresses
        if (details.sender && details.recipient) {
          const addressesDiv = document.createElement("div")
          addressesDiv.style.display = "flex"
          addressesDiv.style.justifyContent = "center"
          addressesDiv.style.alignItems = "center"
          addressesDiv.style.marginBottom = "10px"
          // Sender circle
          const senderDiv = document.createElement("div")
          senderDiv.innerText = formatWalletAddress(details.sender)
          senderDiv.style.border = "1px solid #ccc"
          senderDiv.style.borderRadius = "50%"
          senderDiv.style.width = "50px"
          senderDiv.style.height = "50px"
          senderDiv.style.lineHeight = "50px"
          senderDiv.style.textAlign = "center"
          senderDiv.style.background = "#fff"
          senderDiv.style.position = "relative"
          senderDiv.style.zIndex = "2"
          // Recipient circle (overlapping)
          const recipientDiv = document.createElement("div")
          recipientDiv.innerText = formatWalletAddress(details.recipient)
          recipientDiv.style.border = "1px solid #ccc"
          recipientDiv.style.borderRadius = "50%"
          recipientDiv.style.width = "50px"
          recipientDiv.style.height = "50px"
          recipientDiv.style.lineHeight = "50px"
          recipientDiv.style.textAlign = "center"
          recipientDiv.style.background = "#fff"
          recipientDiv.style.position = "relative"
          recipientDiv.style.left = "-15px" // adjust overlap here
          recipientDiv.style.zIndex = "1"

          addressesDiv.appendChild(senderDiv)
          addressesDiv.appendChild(recipientDiv)
          container.appendChild(addressesDiv)
        }

        // Display transfer details using formatted address for the recipient
        const detailsDiv = document.createElement("div")
        detailsDiv.style.textAlign = "left"
        detailsDiv.style.marginBottom = "20px"
        detailsDiv.innerHTML = `
      <p><strong>Token:</strong> ${details.token.symbol}</p>
      <p><strong>Recipient:</strong> ${formatWalletAddress(details.recipient)}</p>
      <p><strong>Amount:</strong> ${details.value}</p>
      <p><strong>Fee:</strong> ${details.fee}</p>
    `
        container.appendChild(detailsDiv)

        const approveBtn = document.createElement("button")
        approveBtn.innerText = "Approve"
        approveBtn.style.padding = "10px 15px"
        approveBtn.style.backgroundColor = "#4CAF50"
        approveBtn.style.color = "#fff"
        approveBtn.style.border = "none"
        approveBtn.style.borderRadius = "4px"
        approveBtn.style.cursor = "pointer"
        approveBtn.addEventListener("click", () => {
          document.body.removeChild(overlay)
          resolve()
        })

        const cancelBtn = document.createElement("button")
        cancelBtn.innerText = "Cancel"
        cancelBtn.style.padding = "10px 15px"
        cancelBtn.style.backgroundColor = "#f44336"
        cancelBtn.style.color = "#fff"
        cancelBtn.style.border = "none"
        cancelBtn.style.borderRadius = "4px"
        cancelBtn.style.cursor = "pointer"
        cancelBtn.style.marginLeft = "10px"
        cancelBtn.addEventListener("click", () => {
          document.body.removeChild(overlay)
          reject("User cancelled transfer.")
        })

        container.appendChild(approveBtn)
        container.appendChild(cancelBtn)
        overlay.appendChild(container)
        document.body.appendChild(overlay)
      })
    },

    showTransferringAnimation: function () {
      const overlay = document.createElement("div")
      overlay.id = "xterium-transferring-overlay"
      overlay.classList.add("transfer-animation-overlay")

      const container = document.createElement("div")
      container.classList.add("transfer-animation-container")

      const spinner = document.createElement("div")
      spinner.classList.add("spinner")
      container.appendChild(spinner)

      const text = document.createElement("div")
      text.innerText = "Transferring..."
      container.appendChild(text)

      overlay.appendChild(container)
      document.body.appendChild(overlay)

      // Return the overlay so it can be removed once transfer completes.
      return overlay
    }
  }

  window.xterium.loadConnectionState()
  console.log("[Xterium] Injected Successfully!", window.xterium)
}
