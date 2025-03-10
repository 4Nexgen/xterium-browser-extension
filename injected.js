;(function () {
  // ----------------------------
  // Private Helpers & Initialization
  // ----------------------------

  // Helper to format wallet addresses
  function formatWalletAddress(address) {
    if (address.length <= 10) return address
    return address.slice(0, 6) + "..." + address.slice(-6)
  }

  // Inject Font Awesome stylesheet if not already present
  ;(function injectFontAwesome() {
    if (!document.getElementById("font-awesome-styles")) {
      const link = document.createElement("link")
      link.id = "font-awesome-styles"
      link.rel = "stylesheet"
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      document.head.appendChild(link)
    }
  })()

  // ----------------------------
  // Private State Variables
  // ----------------------------
  const extensionId = "plhchpneiklnlplnnlhkmnikaepgfdaf"
  const isXterium = true
  isConnected = false
  connectedWallet = null

  // ----------------------------
  // Private Methods
  // ----------------------------

  // Loads connection state from localStorage
  function loadConnectionState() {
    const savedConnectionState = localStorage.getItem("xterium_wallet_connection")
    if (savedConnectionState) {
      const connectionData = JSON.parse(savedConnectionState)
      isConnected = connectionData.isConnected
      connectedWallet = connectionData.connectedWallet
    }
  }

  // Saves connection state to localStorage
  function saveConnectionState() {
    const connectionData = { isConnected, connectedWallet }
    localStorage.setItem("xterium_wallet_connection", JSON.stringify(connectionData))
  }

  // Opens the extension popup (when no wallets are stored)
  function showExtension() {
    const url = `chrome-extension://${extensionId}/popup.html`
    window.open(url, "_blank")
  }

  // Displays a UI overlay to let the user select a wallet to connect.
  function showSelectWalletToConnect(wallets) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(wallets)) {
        console.error("Expected wallets to be an array, but got:", wallets)
        return reject("Invalid wallets data.")
      }

      const overlay = document.createElement("div")
      overlay.id = "wallet-connect-overlay"
      overlay.classList.add("inject-overlay")

      const outerContainer = document.createElement("div")
      outerContainer.classList.add("outer-container")

      const headerContainer = document.createElement("div")
      headerContainer.classList.add("header-container")

      const closeButton = document.createElement("button")
      closeButton.innerHTML = "&times;"
      closeButton.classList.add("close-button")
      closeButton.addEventListener("click", () => {
        document.body.removeChild(overlay)
        reject("User  closed the wallet connection.")
      })

      const outerHeader = document.createElement("p")
      outerHeader.innerText = "Xterium"
      outerHeader.classList.add("header-title")

      headerContainer.appendChild(outerHeader)
      headerContainer.appendChild(closeButton)
      outerContainer.appendChild(headerContainer)

      const container = document.createElement("div")
      container.classList.add("wallet-connect-container")

      const logo = document.createElement("div")
      logo.classList.add("wallet-logo")

      const header = document.createElement("div")
      header.classList.add("inject-header")
      header.innerText = "Connect Your Wallet"

      const description = document.createElement("p")
      description.classList.add("inject-description")
      description.innerText = "Choose a wallet to proceed:"

      const walletList = document.createElement("div")
      walletList.classList.add("wallet-list")

      wallets.forEach((wallet) => {
        const walletButton = document.createElement("button")
        walletButton.classList.add("inject-button")
        walletButton.innerText = formatWalletAddress(wallet.public_key)
        walletButton.addEventListener("click", () => {
          document.body.removeChild(overlay)
          resolve(wallet)
        })
        walletList.appendChild(walletButton)
      })

      container.appendChild(logo)
      container.appendChild(header)
      container.appendChild(description)
      container.appendChild(walletList)

      overlay.appendChild(container)
      outerContainer.appendChild(container)
      overlay.appendChild(outerContainer)
      document.body.appendChild(overlay)

      let offsetX, offsetY
      outerContainer.addEventListener("mousedown", (e) => {
        offsetX = e.clientX - outerContainer.getBoundingClientRect().left
        offsetY = e.clientY - outerContainer.getBoundingClientRect().top

        const mouseMoveHandler = (moveEvent) => {
          outerContainer.style.position = "absolute"
          outerContainer.style.left = `${moveEvent.clientX - offsetX}px`
          outerContainer.style.top = `${moveEvent.clientY - offsetY}px`
        }

        const mouseUpHandler = () => {
          document.removeEventListener("mousemove", mouseMoveHandler)
          document.removeEventListener("mouseup", mouseUpHandler)
        }

        document.addEventListener("mousemove", mouseMoveHandler)
        document.addEventListener("mouseup", mouseUpHandler)
      })
    })
  }

  // Displays a UI overlay for wallet sign/verify process.
  function showConnectWalletSignAndVerify(wallet) {
    return new Promise((resolve, reject) => {
      const overlay = document.createElement("div")
      overlay.id = "xterium-connect-approval-overlay"
      overlay.classList.add("inject-overlay")

      const outerContainer = document.createElement("div")
      outerContainer.classList.add("outer-container")

      const headerContainer = document.createElement("div")
      headerContainer.classList.add("header-container")

      const closeButton = document.createElement("button")
      closeButton.innerHTML = "&times;"
      closeButton.classList.add("close-button")
      closeButton.addEventListener("click", () => {
        document.body.removeChild(overlay)
        reject("User closed the wallet connection.")
      })

      const header = document.createElement("p")
      header.innerText = "Xterium"
      header.classList.add("header-title")

      headerContainer.appendChild(header)
      headerContainer.appendChild(closeButton)
      outerContainer.appendChild(headerContainer)

      const container = document.createElement("div")
      container.classList.add("confirm-wallet-container")

      const logo = document.createElement("div")
      logo.classList.add("xterium-logo")
      container.appendChild(logo)

      const title = document.createElement("div")
      title.innerText = "Sign Request"
      title.classList.add("inject-header")
      container.appendChild(title)

      const description = document.createElement("p")
      description.classList.add("inject-description")
      description.innerText = "You are signing a message with account"
      container.appendChild(description)

      const detailsDiv = document.createElement("div")
      detailsDiv.classList.add("details-container")

      function createStyledField(name, value) {
        const field = document.createElement("span")
        field.classList.add("styled-text")
        field.innerHTML = `${name}: ${value} `
        return field
      }

      detailsDiv.appendChild(
        createStyledField(
          formatWalletAddress(wallet.name),
          formatWalletAddress(wallet.public_key)
        )
      )
      container.appendChild(detailsDiv)

      const passwordContainer = document.createElement("div")
      passwordContainer.classList.add("password-container")

      const passwordInput = document.createElement("input")
      passwordInput.type = "password"
      passwordInput.placeholder = "Enter Password"
      passwordInput.classList.add("inject-input")

      const togglePassword = document.createElement("i")
      togglePassword.classList.add("fa-solid", "fa-eye-slash")
      togglePassword.style.cursor = "pointer"
      togglePassword.style.marginLeft = "10px"

      togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
          passwordInput.type = "text"
          togglePassword.classList.remove("fa-eye-slash")
          togglePassword.classList.add("fa-eye")
        } else {
          passwordInput.type = "password"
          togglePassword.classList.remove("fa-eye")
          togglePassword.classList.add("fa-eye-slash")
        }
      })
      passwordContainer.appendChild(passwordInput)
      passwordContainer.appendChild(togglePassword)
      container.appendChild(passwordContainer)

      window.postMessage({ type: "XTERIUM_GET_PASSWORD" }, "*")

      let storedPassword = null
      const handlePasswordResponse = (event) => {
        if (
          event.source !== window ||
          !event.data ||
          event.data.type !== "XTERIUM_PASSWORD_RESPONSE"
        )
          return
        if (event.data.password) {
          storedPassword = event.data.password
        }
      }

      window.addEventListener("message", handlePasswordResponse)

      const approveBtn = document.createElement("button")
      approveBtn.classList.add("approve-button")
      approveBtn.innerText = "Approve"
      approveBtn.addEventListener("click", () => {
        if (!passwordInput.value) {
          alert("Password is required to connect the wallet.")
          return
        }
        if (passwordInput.value !== storedPassword) {
          alert("Invalid password. Please try again.")
          return
        }
        document.body.removeChild(overlay)
        window.postMessage(
          { type: "XTERIUM_CONNECT_APPROVED", password: passwordInput.value },
          "*"
        )
        resolve()
      })

      const cancelBtn = document.createElement("button")
      cancelBtn.classList.add("cancel-button")
      cancelBtn.innerText = "Cancel"
      cancelBtn.addEventListener("click", () => {
        document.body.removeChild(overlay)
        reject("User cancelled wallet connection.")
      })

      const buttonContainer = document.createElement("div")
      buttonContainer.classList.add("confirmbutton-container")
      buttonContainer.appendChild(cancelBtn)
      buttonContainer.appendChild(approveBtn)
      container.appendChild(buttonContainer)
      outerContainer.appendChild(container)
      overlay.appendChild(outerContainer)
      document.body.appendChild(overlay)

      let offsetX, offsetY
      outerContainer.addEventListener("mousedown", (e) => {
        offsetX = e.clientX - outerContainer.getBoundingClientRect().left
        offsetY = e.clientY - outerContainer.getBoundingClientRect().top
        const mouseMoveHandler = (moveEvent) => {
          outerContainer.style.position = "absolute"
          outerContainer.style.left = `${moveEvent.clientX - offsetX}px`
          outerContainer.style.top = `${moveEvent.clientY - offsetY}px`
        }
        const mouseUpHandler = () => {
          document.removeEventListener("mousemove", mouseMoveHandler)
          document.removeEventListener("mouseup", mouseUpHandler)
        }
        document.addEventListener("mousemove", mouseMoveHandler)
        document.addEventListener("mouseup", mouseUpHandler)
      })
    })
  }

  // Displays a success animation when wallet is connected.
  function showSuccessConnectWalletMessage(wallet) {
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
    successContainer.style.backgroundColor = "#1C3240"
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
  }

  // Retrieves the token list via postMessage.
  function getTokenList() {
    return new Promise((resolve, reject) => {
      window.postMessage({ type: "XTERIUM_GET_TOKEN_LIST" }, "*")

      function handleTokenListResponse(event) {
        if (
          event.source !== window ||
          !event.data ||
          event.data.type !== "XTERIUM_TOKEN_LIST_RESPONSE"
        )
          return
        window.removeEventListener("message", handleTokenListResponse)
        if (event.data.tokenList) {
          const tokenList = event.data.tokenList.map((token) => {
            if (token.symbol.toUpperCase() === "XON") {
              token.type = "Native"
            }
            return token
          })
          resolve(tokenList)
        } else {
          reject("No token list available.")
        }
      }

      window.addEventListener("message", handleTokenListResponse)
    })
  }
  // function fetchAndDispatchTokenList() {
  //   getTokenList()
  //     .then((tokenList) => {
  //       // Dispatch a custom event with token list as detail.
  //       const event = new CustomEvent("XTERIUM_TOKEN_LIST_READY", {
  //         detail: tokenList
  //       })
  //       window.dispatchEvent(event)
  //     })
  //     .catch((error) => {
  //       console.error("Failed to fetch token list:", error)
  //       // You could dispatch an event indicating failure if needed.
  //     })
  // }
  // Fixes balance values by dividing with a multiplier (default 10^12).
  function fixBalance(value, decimal = 12) {
    const floatValue = parseFloat(value)
    const integralValue = Math.round(floatValue * Math.pow(10, decimal))
    return BigInt(integralValue).toString()
  }

  // Estimates fee via postMessage communication.
  function getEstimateFee(owner, value, recipient, balance) {
    const nativeTokenSymbol = "XON"
    if (!balance.token.type) {
      const tokenSymbol = balance.token.symbol || ""
      balance.token.type =
        tokenSymbol.toUpperCase() === nativeTokenSymbol.toUpperCase() ? "Native" : "Asset"
    }

    console.log("🔄 Sending fee estimation request with:", balance)

    return new Promise((resolve, reject) => {
      function handleFeeResponse(event) {
        if (event.source !== window || !event.data) return
        if (event.data.type !== "XTERIUM_ESTIMATE_FEE_RESPONSE") return
        if (event.data.owner !== owner) return
        window.removeEventListener("message", handleFeeResponse)
        if (event.data.error) {
          console.error("❌ Fee estimation error:", event.data.error)
          reject(event.data.error)
        } else {
          console.log("✅ Estimated fee received:", event.data.substrateFee)
          resolve(event.data.substrateFee)
        }
      }

      window.addEventListener("message", handleFeeResponse)
      window.postMessage(
        { type: "XTERIUM_GET_ESTIMATE_FEE", owner, value, recipient, balance },
        "*"
      )
    })
  }

  // Displays a UI overlay to confirm transfer details and sign/verify.
  let isTransferUIVisible = false;
  function showTransferSignAndVerify(details) {
    if (document.getElementById("xterium-transfer-approval-overlay")) {
      return Promise.resolve()
    }
    isTransferUIVisible = true;

    console.log("🟢 Showing Transfer UI with fee:", details.fee)
    return new Promise((resolve, reject) => {
      const overlay = document.createElement("div")
      overlay.id = "xterium-transfer-approval-overlay"
      overlay.classList.add("inject-overlay")

      const outerContainer = document.createElement("div")
      outerContainer.classList.add("outer-container")

      const headerContainer = document.createElement("div")
      headerContainer.classList.add("header-container")

      const container = document.createElement("div")
      container.classList.add("transfer-container")

      const outerHeader = document.createElement("p")
      outerHeader.innerText = "Xterium"
      outerHeader.classList.add("header-title")

      headerContainer.appendChild(outerHeader)
      outerContainer.appendChild(headerContainer)

      const title = document.createElement("div")
      title.innerText = "Confirm Transfer"
      title.classList.add("inject-header")
      container.appendChild(title)

      if (details.sender && details.recipient) {
        const addressesDiv = document.createElement("div")
        addressesDiv.classList.add("transfer-address")

        const senderDiv = document.createElement("div")
        senderDiv.innerText = formatWalletAddress(details.sender)
        senderDiv.classList.add("sender-circle")

        const recipientDiv = document.createElement("div")
        recipientDiv.innerText = formatWalletAddress(details.recipient)
        recipientDiv.classList.add("recipient-circle")

        addressesDiv.appendChild(senderDiv)
        addressesDiv.appendChild(recipientDiv)
        container.appendChild(addressesDiv)
      }

      const detailsDiv = document.createElement("div")
      detailsDiv.classList.add("details-container")

      function createStyledField(label, value) {
        const field = document.createElement("div")
        field.classList.add("details-field")
        field.innerHTML = `<strong>${label}:</strong> ${value}`
        return field
      }

      detailsDiv.appendChild(createStyledField("Token Symbol", details.token.symbol))
      detailsDiv.appendChild(
        createStyledField("Recipient", formatWalletAddress(details.recipient))
      )
      detailsDiv.appendChild(createStyledField("Amount", details.value))
      detailsDiv.appendChild(createStyledField("Fee", details.fee))
      container.appendChild(detailsDiv)

      const passwordContainer = document.createElement("div")
      passwordContainer.classList.add("password-container")

      const passwordLabel = document.createElement("label")
      passwordLabel.innerText = "password:"
      passwordLabel.classList.add("inject-label")
      passwordContainer.appendChild(passwordLabel)

      const passwordInput = document.createElement("input")
      passwordInput.type = "password"
      passwordInput.placeholder = "Enter Password"
      passwordInput.classList.add("request-inject-input")

      const togglePassword = document.createElement("i")
      togglePassword.classList.add("fa-solid", "fa-eye-slash")
      togglePassword.style.cursor = "pointer"
      togglePassword.style.marginLeft = "10px"
      togglePassword.style.marginTop = "3.5%"

      togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
          passwordInput.type = "text"
          togglePassword.classList.remove("fa-eye-slash")
          togglePassword.classList.add("fa-eye")
        } else {
          passwordInput.type = "password"
          togglePassword.classList.remove("fa-eye")
          togglePassword.classList.add("fa-eye-slash")
        }
      })

      passwordContainer.appendChild(passwordInput)
      passwordContainer.appendChild(togglePassword)
      container.appendChild(passwordContainer)

      window.postMessage({ type: "XTERIUM_GET_PASSWORD" }, "*")

      let storedPassword = null
      const handlePasswordResponse = (event) => {
        if (
          event.source !== window ||
          !event.data ||
          event.data.type !== "XTERIUM_PASSWORD_RESPONSE"
        )
          return
        if (event.data.password) {
          storedPassword = event.data.password
        }
      }

      window.addEventListener("message", handlePasswordResponse)

      const approveBtn = document.createElement("button")
      approveBtn.classList.add("transfer-approve-button")
      approveBtn.innerText = "Approve"
      approveBtn.addEventListener("click", () => {
        if (!passwordInput.value) {
          alert("Password is required to connect the wallet.")
          return
        }
        if (passwordInput.value !== storedPassword) {
          alert("Invalid password. Please try again.")
          return
        }

        const processingOverlay = showTransferProcessing()

        transfer(details.token, details.recipient, details.value, passwordInput.value)
          .then((response) => {
            console.log("Transfer successful:", response)
            if (document.body.contains(processingOverlay)) {
              document.body.removeChild(processingOverlay)
            }
            showTransferSuccess(processingOverlay)
            window.postMessage({ type: "XTERIUM_TRANSFER_SUCCESS", response }, "*")
          })
          .catch((err) => {
            console.error("Transfer failed:", err)
            if (document.body.contains(processingOverlay)) {
              document.body.removeChild(processingOverlay)
            }
            window.postMessage({ type: "XTERIUM_TRANSFER_FAILED", error: err }, "*")
          })

        document.body.removeChild(overlay)
        isTransferUIVisible = false;
      })

      const cancelBtn = document.createElement("button")
      cancelBtn.classList.add("transfer-reject-button")
      cancelBtn.innerText = "Reject"
      cancelBtn.addEventListener("click", () => {
        document.body.removeChild(overlay)
        reject("User cancelled transfer.")
      })

      const buttonContainer = document.createElement("div")
      buttonContainer.classList.add("transfer-button-container")
      container.appendChild(approveBtn)
      container.appendChild(cancelBtn)

      overlay.appendChild(container)
      outerContainer.appendChild(container)
      overlay.appendChild(outerContainer)
      document.body.appendChild(overlay)

      let offsetX, offsetY
      outerContainer.addEventListener("mousedown", (e) => {
        offsetX = e.clientX - outerContainer.getBoundingClientRect().left
        offsetY = e.clientY - outerContainer.getBoundingClientRect().top
        const mouseMoveHandler = (moveEvent) => {
          outerContainer.style.position = "absolute"
          outerContainer.style.left = `${moveEvent.clientX - offsetX}px`
          outerContainer.style.top = `${moveEvent.clientY - offsetY}px`
        }
        const mouseUpHandler = () => {
          document.removeEventListener("mousemove", mouseMoveHandler)
          document.removeEventListener("mouseup", mouseUpHandler)
        }
        document.addEventListener("mousemove", mouseMoveHandler)
        document.addEventListener("mouseup", mouseUpHandler)
      })
    })
  }

  // Displays a processing overlay during transfer
  function showTransferProcessing() {
    const overlay = document.createElement("div")
    overlay.id = "xterium-transfer-overlay"
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
  }

  // Displays a success overlay after transfer completes
  function showTransferSuccess(overlay) {
    if (!overlay) {
      console.error("Overlay is undefined. Cannot show transfer success.")
      return
    }
    overlay.innerHTML = ""
    const container = document.createElement("div")
    container.classList.add("showTransferSuccess-animation-container")

    const checkContainer = document.createElement("div")
    checkContainer.classList.add("check-container")

    const checkMark = document.createElement("div")
    checkMark.classList.add("check-mark")
    checkMark.innerText = "✓"
    checkContainer.appendChild(checkMark)
    container.appendChild(checkContainer)

    const successText = document.createElement("div")
    successText.classList.add("success-text")
    successText.innerText = "Transfer Successful"
    container.appendChild(successText)

    overlay.appendChild(container)
  }

  // Disconnects the wallet by resetting connection state and removing overlays
  function disconnectWallet() {
    console.log("[Xterium] Disconnecting wallet...")

    localStorage.setItem(
      "xterium_wallet_connection",
      JSON.stringify({
        isConnected: false,
        connectedWallet: null
      })
    )

    const overlays = document.querySelectorAll(
      "#wallet-connect-overlay, #wallet-success-overlay, #send-receive-overlay"
    )
    overlays.forEach((overlay) => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
    })

    console.log("Wallet disconnected.")
  }

  // ----------------------------
  // Public API Methods
  // ----------------------------

  // Retrieves wallets via postMessage.
  function getWallets() {
    return new Promise((resolve, reject) => {
      if (isConnected && connectedWallet) {
        console.log("[Xterium] Wallet already connected:", connectedWallet.public_key)
        return resolve([connectedWallet.public_key])
      }

      window.postMessage({ type: "XTERIUM_GET_WALLETS" }, "*")

      function handleResponse(event) {
        if (
          event.source !== window ||
          !event.data ||
          event.data.type !== "XTERIUM_WALLETS_RESPONSE"
        )
          return
        window.removeEventListener("message", handleResponse)
        let wallets = event.data.wallets
        try {
          if (typeof wallets === "string") {
            wallets = JSON.parse(wallets)
          }
          if (!Array.isArray(wallets)) {
            throw new Error("wallets is not an array after parsing")
          }
          if (wallets.length === 0) {
            showExtension()
            return reject("No wallets stored.")
          }
          showSelectWalletToConnect(wallets)
            .then((wallet) => {
              isConnected = true
              connectedWallet = wallet
              saveConnectionState()
              resolve([wallet.public_key])
            })
            .catch((err) => {
              reject(err)
            })
        } catch (error) {
          console.error("[Injected.js] Error parsing wallets:", error)
          reject("Failed to parse wallets data.")
        }
      }

      window.addEventListener("message", handleResponse)
    })
  }

  // Retrieves balance for the given public key.
  function getBalance(publicKey) {
    return new Promise((resolve, reject) => {
      if (!isConnected || !connectedWallet) {
        console.error("[Injected.js] getBalance error: No wallet connected.")
        return reject("No wallet connected.")
      }
      if (connectedWallet.public_key !== publicKey) {
        console.error(
          "[Injected.js] getBalance error: Requested public key does not match the connected wallet."
        )
        return reject("Not connected to that wallet.")
      }

      function handleResponse(event) {
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
            if (typeof balanceData === "string") {
              balanceData = JSON.parse(balanceData)
            }
            let fixedBalance
            if (Array.isArray(balanceData)) {
              fixedBalance = balanceData.map((item) => ({
                tokenName: item.tokenName,
                freeBalance: fixBalance(item.freeBalance, 12),
                reservedBalance: fixBalance(item.reservedBalance, 12),
                is_frozen: item.is_frozen
              }))
            } else if (typeof balanceData === "object") {
              fixedBalance = Object.keys(balanceData).map((token) => ({
                tokenName: token,
                freeBalance: fixBalance(balanceData[token].freeBalance, 12),
                reservedBalance: fixBalance(balanceData[token].reservedBalance, 12),
                is_frozen: balanceData[token].is_frozen
              }))
            } else {
              fixedBalance = fixBalance(balanceData, 12)
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
      window.postMessage({ type: "XTERIUM_GET_BALANCE", publicKey }, "*")
    })
  }

  // Initiates a token transfer.
  let isFeeEstimationInProgress = false;

  function transfer(token, recipient, value, password) {
    console.log("Transfer initiated with:", { token, recipient, value, password })
    return new Promise((resolve, reject) => {
      if (!isConnected || !connectedWallet) {
        console.error("No wallet connected.")
        return reject("No wallet connected. Please connect your wallet first.")
      }
      if (!token) {
        console.error("Token parameter is required.")
        return reject("Token parameter is required.")
      }

      let tokenSymbol = ""
      if (typeof token === "string") {
        tokenSymbol = token.trim()
      } else if (token && token.symbol) {
        tokenSymbol = token.symbol
      } else {
        return reject(
          "Invalid token parameter. Must be a string or object with a symbol property."
        )
      }

      const nativeTokenSymbol = "XON"
      let tokenObj = {
        symbol: tokenSymbol,
        type:
          tokenSymbol.toUpperCase() === nativeTokenSymbol.toUpperCase()
            ? "Native"
            : "Asset"
      }

      if (!recipient || recipient.trim() === "") {
        console.error("Recipient address is required.")
        return reject("Recipient address is required.")
      }
      if (!value || isNaN(value) || Number(value) <= 0) {
        console.error("Transfer value must be a positive number.")
        return reject("Transfer value must be a positive number.")
      }

      const owner = connectedWallet.public_key

      getBalance(owner)
        .then((balances) => {
          const userBalance = balances.find((b) => b.tokenName === tokenSymbol)
          if (!userBalance || userBalance.freeBalance < Number(value)) {
            return reject(
              `Insufficient balance. Your available balance is ${userBalance ? userBalance.freeBalance : 0} ${tokenSymbol}.`
            )
          }
          return getTokenList()
        })
        .then((tokenList) => {
          console.log("Available tokens:", tokenList)
          if (Array.isArray(tokenList)) {
            const foundToken = tokenList.find(
              (t) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase()
            )
            if (foundToken) {
              tokenObj = foundToken
              tokenObj.type =
                tokenSymbol.toUpperCase() === nativeTokenSymbol.toUpperCase()
                  ? "Native"
                  : "Asset"
            } else {
              console.error("Unknown token type:", tokenSymbol)
              return Promise.reject("Unknown token type. Please select a valid token.")
            }
          }
          if (isFeeEstimationInProgress) {
            console.log("Fee estimation is already in progress. Skipping duplicate request.");
            return;
        }
        isFeeEstimationInProgress = true;
          return getEstimateFee(owner, Number(value), recipient, { token: tokenObj })
        })
        .then((fee) => {
          console.log("Estimated fee:", fee)
          isFeeEstimationInProgress = false;
          window.postMessage(
            {
              type: "XTERIUM_TRANSFER_REQUEST",
              payload: {
                token: tokenObj,
                owner,
                recipient,
                value: Number(value),
                password
              }
            },
            "*"
          )
          function handleTransferResponse(event) {
            if (event.source !== window || !event.data) return
            if (event.data.type === "XTERIUM_TRANSFER_RESPONSE") {
              window.removeEventListener("message", handleTransferResponse)
              if (event.data.error) {
                console.error("Transfer error:", event.data.error)
                reject(event.data.error)
              } else {
                resolve(event.data.response)
              }
            }
          }
          window.addEventListener("message", handleTransferResponse)
        })
        .catch((err) => {
          console.error("Fee estimation or transfer error:", err)
          isFeeEstimationInProgress = false;
          reject(err)
        }
      )
    })
  }

  ;(() => {
    function initiateTransfer(details) {
      const valueBigInt = BigInt(details.value)

      const formattedValue = (valueBigInt / BigInt(10 ** 12)).toString()
      console.log("[initiateTransfer] Formatted Amount:", formattedValue)

      details.value = formattedValue

      if (!details.fee) {
        console.log("🔄 Fee is missing, estimating now...")

        if (details.feeEstimationInProgress) {
          console.log(
            "⏳ Fee estimation already in progress. Skipping duplicate request."
          )
          return
        }

        details.feeEstimationInProgress = true

        const nativeTokenSymbol = "XON"
        details.token.type =
          details.token.symbol.toUpperCase() === nativeTokenSymbol.toUpperCase()
            ? "Native"
            : "Asset"

        getEstimateFee(details.owner, valueBigInt, details.recipient, {
          token: details.token
        })
          .then((fee) => {
            console.log("✅ Fee received:", fee.partialFee)
            details.fee = fee.partialFee
            details.feeEstimationInProgress = false
            setTimeout(() => showTransferSignAndVerify(details), 0)
          })
          .catch((err) => {
            console.error("❌ Fee estimation failed:", err)
            details.feeEstimationInProgress = false
          })

        return
      }

      showTransferSignAndVerify(details)
    }

    window.addEventListener("message", async (event) => {
      if (!event.data || event.source !== window) return

      switch (event.data.type) {
        case "XTERIUM_TRANSFER_REQUEST":
          const transferDetails = event.data.payload

          if (document.getElementById("xterium-transfer-approval-overlay")) {
            console.log(
              "⚠️ Transfer approval UI is already displayed. Skipping duplicate execution."
            )
            return
          }

          initiateTransfer(transferDetails)
          break
        default:
          break
      }
    })
  })()

  window.addEventListener("message", async (event) => {
    if (!event.data || event.source !== window) return

    switch (event.data.type) {
      case "XTERIUM_SHOW_EXTENSION":
        showExtension()
        break

      case "XTERIUM_WALLETS_RESPONSE":
        if (!isConnected) {
          let wallets = event.data.wallets

          if (typeof wallets === "string") {
            try {
              wallets = JSON.parse(wallets)
            } catch (error) {
              console.error("Failed to parse wallets data:", error)
              return reject("Invalid wallets data.")
            }
          }

          if (!Array.isArray(wallets)) {
            console.error("Expected wallets to be an array, but got:", wallets)
            return reject("Invalid wallets data.")
          }

          if (wallets.length === 0) {
            showExtension()
          } else {
            showSelectWalletToConnect(wallets)
              .then((wallet) => {
                isConnected = true
                connectedWallet = wallet
                window.postMessage({ type: "XTERIUM_WALLET_SELECTED", wallet }, "*")
              })
              .catch((err) => {
                console.error(err)
              })
          }
        }
        break

      case "XTERIUM_CONNECT_WALLET_SIGN_AND_VERIFY":
        const wallet = event.data.wallet
        showConnectWalletSignAndVerify(wallet)
          .then(() => {
            isConnected = true
            connectedWallet = wallet
            saveConnectionState()
            console.log("Wallet sign/verify approved.")
            showSuccessConnectWalletMessage(wallet)

            window.postMessage({ type: "XTERIUM_CONNECT_WALLET_VERIFIED" }, "*")
          })
          .catch((err) => {
            console.error("Wallet sign/verify rejected:", err)
          })
        break
      default:
        break
    }
  })

  // ----------------------------
  // Module Initialization & Exposure
  // ----------------------------
  loadConnectionState()
  console.log("[Xterium] Injected Successfully!", {
    extensionId,
    isXterium,
    isConnected,
    connectedWallet
  })

  // Expose the public API methods...
  window.xterium = {
    getWallets,
    getBalance,
    transfer
  }

  // ...and expose read-only connection state via getters
  Object.defineProperty(window.xterium, "isConnected", {
    get: function () {
      return isConnected
    },
    enumerable: true
  })
  Object.defineProperty(window.xterium, "connectedWallet", {
    get: function () {
      return connectedWallet
    },
    enumerable: true
  })
})()
