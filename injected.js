;(function () {
  // ----------------------------
  // Private Helpers & Initialization
  // ----------------------------

  // Helper to format wallet addresses
  let isTransferInProgress = false
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

      let storedPassword = null;

      const approveBtn = document.createElement("button")
      approveBtn.classList.add("approve-button")
      approveBtn.innerText = "Approve"
      approveBtn.addEventListener("click", async () => {
          if (!passwordInput.value) {
            alert("Password is required to connect the wallet.")
            return
          }

        if (storedPassword && passwordInput.value === storedPassword) {
          document.body.removeChild(overlay);
          window.postMessage(
            { type: "XTERIUM_CONNECT_APPROVED", password: passwordInput.value },
            "*"
          );
          resolve();
          return;
        }

        const timeoutId = setTimeout(() => {
          window.removeEventListener("message", handlePasswordResponse)
          alert("Password verification timed out.")
        }, 5000)
      
        const handlePasswordResponse = (event) => {
          if (!event.data || event.data.type !== "XTERIUM_PASSWORD_RESPONSE") return

        clearTimeout(timeoutId);
        window.removeEventListener("message", handlePasswordResponse);


        if (event.data.isAuthenticated) {
          storedPassword = passwordInput.value;
          document.body.removeChild(overlay);
          window.postMessage(
            { type: "XTERIUM_CONNECT_APPROVED", password: passwordInput.value },
            "*"
          );
          resolve();
        } else {
          alert("Invalid password. Please try again.");
        }
      };
  
      window.addEventListener("message", handlePasswordResponse);
      
        window.postMessage(
          {
            type: "XTERIUM_GET_PASSWORD",
            password: passwordInput.value
          },
          "*"
        )
      })

      const cancelBtn = document.createElement("button")
      cancelBtn.classList.add("cancel-button")
      cancelBtn.innerText = "Cancel"
      cancelBtn.addEventListener("click", () => {
        document.body.removeChild(overlay)
        reject("User  cancelled wallet connection.")
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

        try {
          let tokenList = event.data.tokenList

          if (typeof tokenList === "string") {
            tokenList = JSON.parse(tokenList)
          }

          if (!Array.isArray(tokenList)) {
            console.error("Token list is not an array:", tokenList)
            return reject("Token list is not an array.")
          }

          const validTokenList = tokenList
            .map((token) => {
              if (!token || typeof token !== "object") {
                console.error("Invalid token format:", token)
                return null
              }

              if (!token.symbol || typeof token.symbol !== "string") {
                console.error("Token symbol is missing or invalid:", token)
                return null
              }

              if (!token.type || typeof token.type !== "string") {
                console.error("Token type is missing or invalid:", token)
                return null
              }

              if (token.symbol.toUpperCase() === "XON") {
                token.type = "Native"
              }

              return token
            })
            .filter((token) => token !== null)

          if (validTokenList.length === 0) {
            console.error("No valid tokens found in the token list.")
            return reject("No valid tokens found.")
          }

          resolve(validTokenList)
        } catch (error) {
          console.error("Error parsing token list:", error)
          reject("Failed to parse token list.")
        }
      }

      window.addEventListener("message", handleTokenListResponse)
    })
  }

  function getEstimateFee(owner, value, recipient, balance) {
    return new Promise((resolve, reject) => {
      function handleFeeResponse(event) {
        if (event.source !== window || !event.data) return
        if (event.data.type !== "XTERIUM_ESTIMATE_FEE_RESPONSE") return
        if (event.data.owner !== owner) return
        window.removeEventListener("message", handleFeeResponse)
        if (event.data.error) {
          console.error("Fee estimation error:", event.data.error)
          reject(event.data.error)
        } else {
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
  function showTransferSignAndVerify(details) {
    if (document.getElementById("xterium-transfer-approval-overlay")) {
      return Promise.resolve()
    }
    if (!details.fee) {
      return
    }
    let numValue = Number(details.value)
    if (numValue >= 1e12) {
      numValue /= 1e12
    }
    const formattedAmount = (Number(details.value) / 1e12)
      .toFixed(12)
      .replace(/\.?0+$/, "")

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
        field.innerHTML = `${label}: <strong> ${value} </strong>`
        return field
      }

      detailsDiv.appendChild(createStyledField("Token Symbol", details.token.symbol))
      detailsDiv.appendChild(
        createStyledField("Recipient", formatWalletAddress(details.recipient))
      )
      detailsDiv.appendChild(createStyledField("Amount", formattedAmount))
      detailsDiv.appendChild(createStyledField("Fee", details.fee))
      container.appendChild(detailsDiv)

      const passwordContainer = document.createElement("div")
      passwordContainer.classList.add("password-container")

      const passwordLabel = document.createElement("label")
      passwordLabel.innerText = "Password:"
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

      let storedPassword = null;
      
      const approveBtn = document.createElement("button")
      approveBtn.classList.add("approve-button")
      approveBtn.innerText = "Approve"
      approveBtn.addEventListener("click", async () => {
        if (!passwordInput.value) {
          alert("Password is required to connect the wallet.")
          return
        }
      
        const handlePasswordResponse = (event) => {
          if (event.data && event.data.type === "XTERIUM_PASSWORD_RESPONSE") {
            if (event.data.isAuthenticated) {
              storedPassword = passwordInput.value
              document.body.removeChild(overlay)
              window.postMessage(
                { type: "XTERIUM_TRANSFER_APPROVED", details, password: passwordInput.value },
                "*"
              )
              resolve()
            } else {
              alert("Invalid password. Please try again.")
            }
      
            window.removeEventListener("message", handlePasswordResponse)
          }
        }
      
        window.addEventListener("message", handlePasswordResponse)
      
        // Then send a request to check password
        window.postMessage(
          { type: "XTERIUM_GET_PASSWORD", password: passwordInput.value },
          "*"
        )
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
    text.innerText = "Processing..."
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

  // ----------------------------
  // Public API Methods
  // ----------------------------

  // Retrieves wallets via postMessage.
  function getWallets() {
    return new Promise((resolve, reject) => {
      if (isConnected && connectedWallet) {
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
        return reject("No wallet connected.")
      }

      window.postMessage(
        {
          type: "XTERIUM_GET_ALL_BALANCES",
          publicKey
        },
        "*"
      )

      const handleResponse = (event) => {
        if (
          event.source !== window ||
          !event.data ||
          event.data.type !== "XTERIUM_ALL_BALANCES_RESPONSE"
        ) {
          return
        }

        if (event.data.publicKey !== publicKey) return

        window.removeEventListener("message", handleResponse)

        if (event.data.error) {
          reject(event.data.error)
        } else {
          resolve(event.data.balances)
        }
      }

      window.addEventListener("message", handleResponse)
    })
  }

  // Initiates a token transfer.
  function transfer(token, recipient, value, password) {
    const amount = (Number(value) / 1e12).toFixed(12)
    console.log("Transfer initiated with:", { token, recipient, amount })
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

      const nativeTokenSymbol = ""
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

      if (recipient === owner) {
        return reject("You cannot transfer to your own wallet.")
      }

      getBalance(owner)
        .then((balances) => {
          const userBalance = balances.find((b) => b.tokenName === tokenSymbol)
          if (!userBalance) {
            return reject(`No balance found for token: ${tokenSymbol}.`)
          }
          const availableBalance = parseFloat(userBalance.freeBalance)
          const transferAmount = parseFloat((Number(value) / 1e12).toFixed(12))

          if (transferAmount > availableBalance) {
            alert("Balance not enough. Please enter a valid amount.")
            return
          }
          return getTokenList()
        })
        .then((tokenList) => {
          if (Array.isArray(tokenList)) {
            const foundToken = tokenList.find(
              (t) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase()
            )
            if (foundToken) {
              tokenObj = foundToken
            } else {
              console.error("Unknown token type:", tokenSymbol)
              return Promise.reject("Unknown token type. Please select a valid token.")
            }
          }
          return getEstimateFee(owner, Number(value), recipient, { token: tokenObj })
        })
        .then((fee) => {
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
          reject(err)
        })
    })
  }

  ;(() => {
    let isTransferInProgress = false
    function initiateTransfer(details) {
      if (isTransferInProgress) {
        return
      }

      isTransferInProgress = true

      if (!details.fee) {
        if (details.feeEstimationInProgress) {
          return
        }

        details.feeEstimationInProgress = true

        getEstimateFee(details.owner, BigInt(details.value), details.recipient, {
          token: details.token
        })
          .then((fee) => {
            details.fee = fee.partialFee
            details.feeEstimationInProgress = false
            setTimeout(() => showTransferSignAndVerify(details), 0)
          })
          .catch((err) => {
            console.error("Fee estimation failed:", err)
            details.feeEstimationInProgress = false
            isTransferInProgress = false
          })

        return
      }

      showTransferSignAndVerify(details)
    }
    if (!window.xteriumMessageListenerAdded) {
      window.addEventListener("message", async (event) => {
        if (!event.data || event.source !== window) return

        switch (event.data.type) {
          case "XTERIUM_TRANSFER_REQUEST":
            const transferDetails = event.data.payload

            if (document.getElementById("xterium-transfer-approval-overlay")) {
              return
            }

            initiateTransfer(transferDetails)
            break
          case "XTERIUM_TRANSFER_APPROVED":
            const processingOverlay = showTransferProcessing()
            const { token, recipient, value, password } = event.data.details

            transfer(token, recipient, value, password)
              .then((response) => {
                if (document.body.contains(processingOverlay)) {
                  document.body.removeChild(processingOverlay)
                }
                showTransferSuccess(processingOverlay)
                window.postMessage(
                  {
                    type: "XTERIUM_REFRESH_BALANCE",
                    publicKey: connectedWallet.public_key,
                    token
                  },
                  "*"
                )

                window.postMessage({ type: "XTERIUM_TRANSFER_SUCCESS", response }, "*")
                isTransferInProgress = false
              })
              .catch((err) => {
                if (document.body.contains(processingOverlay)) {
                  document.body.removeChild(processingOverlay)
                }
                window.postMessage({ type: "XTERIUM_TRANSFER_FAILED", error: err }, "*")
                isTransferInProgress = false
              })

            window.addEventListener("message", (event) => {
              if (event.data && event.data.type === "XTERIUM_UPDATED_BALANCE") {
              }
            })
            break
          case "XTERIUM_GET_WALLET_BALANCE":
            const publicKey = event.data.publicKey
            getBalance(publicKey)
              .then((balance) => {
                window.postMessage(
                  { type: "XTERIUM_BALANCE_RESPONSE", publicKey, balance },
                  "*"
                )
              })
              .catch((error) => {
                window.postMessage(
                  { type: "XTERIUM_BALANCE_RESPONSE", publicKey, error: error },
                  "*"
                )
              })
            break
          default:
            break
        }
      })
      window.xteriumMessageListenerAdded = true
    }
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
                saveConnectionState()

                window.postMessage(
                  {
                    type: "XTERIUM_GET_ALL_BALANCES",
                    publicKey: wallet.public_key
                  },
                  "*"
                )

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
            showSuccessConnectWalletMessage(wallet)

            window.postMessage({ type: "XTERIUM_CONNECT_WALLET_VERIFIED" }, "*")
          })
          .catch((err) => {
            console.error("Wallet sign/verify rejected:", err)
          })
        break
      case "XTERIUM_ALL_BALANCES_RESPONSE":
        if (event.data.publicKey === connectedWallet?.public_key) {
          console.log("Received balances:", event.data.balances)

          if (event.data.error) {
            console.error("Error fetching balances:", event.data.error)
          }
        }
        break
      default:
        break
    }
  })

  // ----------------------------
  // Module Initialization & Exposure
  // ----------------------------
  loadConnectionState()

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
