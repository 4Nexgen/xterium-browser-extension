function formatWalletAddress(address) {
  if (address.length <= 10) return address; // If address is too short, no need to truncate
  return address.slice(0, 6) + "........" + address.slice(-6);
}

if (!window.xterium) {
  console.log("[Injected.js] Script executed!");
  window.xterium = {
    extensionId: "jdljmhgiecpgbmellhlpdggmponadiln",
    isXterium: true,
    isConnected: false,
    connectedWallet: null,

    fixBalance: function (value, decimal = 12) {
      const multiplier = 10 ** decimal;
      return parseFloat(value.toString()) / multiplier;
    },

    loadConnectionState: function () {
      const savedConnectionState = localStorage.getItem("xterium_wallet_connection");
      if (savedConnectionState) {
        const connectionData = JSON.parse(savedConnectionState);
        this.isConnected = connectionData.isConnected;
        this.connectedWallet = connectionData.connectedWallet;
        console.log("[Xterium] Wallet state loaded from localStorage:", this.connectedWallet);
      }
    },

    saveConnectionState: function () {
      const connectionData = {
        isConnected: this.isConnected,
        connectedWallet: this.connectedWallet
      };
      localStorage.setItem("xterium_wallet_connection", JSON.stringify(connectionData));
      console.log("[Xterium] Wallet state saved to localStorage.");
    },

    getWallets: function () {
      return new Promise((resolve, reject) => {
        if (this.isConnected && this.connectedWallet) {
          console.log("[Xterium] Wallet already connected:", this.connectedWallet.public_key);
          resolve([this.connectedWallet.public_key]);
        } else {
          window.postMessage({ type: "XTERIUM_GET_WALLETS" }, "*");

          const handleResponse = (event) => {
            if (
              event.source !== window ||
              !event.data ||
              event.data.type !== "XTERIUM_WALLETS_RESPONSE"
            )
              return;
            window.removeEventListener("message", handleResponse);
            if (event.data.wallets) {
              let wallets = event.data.wallets;
              try {
                if (typeof wallets === "string") {
                  wallets = JSON.parse(wallets);
                }
                if (typeof wallets === "string") {
                  wallets = JSON.parse(wallets);
                }
                if (!Array.isArray(wallets)) {
                  throw new Error("wallets is not an array after parsing");
                }
                if (wallets.length === 0) {
                  window.xterium.showExtension();
                  return reject("No wallets stored.");
                }
                window.xterium
                  .showConnectPrompt(wallets)
                  .then((wallet) => {
                    window.xterium.isConnected = true;
                    window.xterium.connectedWallet = wallet;
                    window.xterium.saveConnectionState();
                    resolve([wallet.public_key]);
                  })
                  .catch((err) => {
                    reject(err);
                  });
              } catch (error) {
                console.error("[Injected.js] Error parsing wallets:", error);
                reject("Failed to parse wallets data.");
              }
            } else {
              reject("No wallets found.");
            }
          };

          window.addEventListener("message", handleResponse);
        }
      });
    },

    showConnectPrompt: function (wallets) {
      return new Promise((resolve, reject) => {
        const overlay = document.createElement("div");
        overlay.id = "wallet-connect-overlay";
        overlay.classList.add("inject-overlay");

        const outerContainer = document.createElement("div");
        outerContainer.classList.add("outer-container");

        const headerContainer = document.createElement("div");
        headerContainer.classList.add("header-container");

        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&times;";
        closeButton.classList.add("close-button");
        closeButton.addEventListener("click", () => {
          document.body.removeChild(overlay);
          reject("User closed the wallet connection.");
        });

        const outerHeader = document.createElement("p");
        outerHeader.innerText = "Xterium";
        outerHeader.classList.add("header-title");

        headerContainer.appendChild(outerHeader);
        headerContainer.appendChild(closeButton);
        outerContainer.appendChild(headerContainer);

        const container = document.createElement("div");
        container.classList.add("wallet-connect-container");

        const logo = document.createElement("div");
        logo.classList.add("wallet-logo");

        const header = document.createElement("div");
        header.classList.add("inject-header");
        header.innerText = "Connect Your Wallet";

        const description = document.createElement("p");
        description.classList.add("inject-description");
        description.innerText = "Choose a wallet to proceed:";

        const walletList = document.createElement("div");
        walletList.classList.add("wallet-list");

        wallets.forEach((wallet) => {
          const walletButton = document.createElement("button");
          walletButton.classList.add("inject-button");
          walletButton.innerText = formatWalletAddress(wallet.public_key);
          walletButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            resolve(wallet);
          });
          walletList.appendChild(walletButton);
        });

        container.appendChild(logo);
        container.appendChild(header);
        container.appendChild(description);
        container.appendChild(walletList);

        overlay.appendChild(container);
        outerContainer.appendChild(container);
        overlay.appendChild(outerContainer);
        document.body.appendChild(overlay);

        let offsetX, offsetY;
        outerContainer.addEventListener("mousedown", (e) => {
          offsetX = e.clientX - outerContainer.getBoundingClientRect().left;
          offsetY = e.clientY - outerContainer.getBoundingClientRect().top;

          const mouseMoveHandler = (moveEvent) => {
            outerContainer.style.position = 'absolute';
            outerContainer.style.left = `${moveEvent.clientX - offsetX}px`;
            outerContainer.style.top = `${moveEvent.clientY - offsetY}px`;
          };

          const mouseUpHandler = () => {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
          };

          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        });
      });
    },

    showConnectApprovalUI: function (wallet) {
      return new Promise((resolve, reject) => {
        const overlay = document.createElement("div");
        overlay.id = "xterium-connect-approval-overlay";
        overlay.classList.add("inject-overlay");

        const outerContainer = document.createElement("div");
        outerContainer.classList.add("outer-container");

        const headerContainer = document.createElement("div");
        headerContainer.classList.add("header-container");

        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&times;";
        closeButton.classList.add("close-button");
        closeButton.addEventListener("click", () => {
          document.body.removeChild(overlay);
          reject("User closed the wallet connection.");
        });

        const header = document.createElement("p");
        header.innerText = "Xterium";
        header.classList.add("header-title");

        headerContainer.appendChild(header);
        headerContainer.appendChild(closeButton);
        outerContainer.appendChild(headerContainer);

        const container = document.createElement("div");
        container.classList.add("confirm-wallet-container");

        const logo = document.createElement("div");
        logo.classList.add("xterium-logo");
        container.appendChild(logo);

        const title = document.createElement("div");
        title.innerText = "Sign Request";
        title.classList.add("inject-header");
        container.appendChild(title);

        const description = document.createElement("p");
        description.classList.add("inject-description");
        description.innerText = "You are signing a message with account";
        container.appendChild(description);

        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("details-container");

        function createStyledField(name, value) {
          const field = document.createElement("span");
          field.classList.add("styled-text");
          field.innerHTML = `${name}: ${value} `;
          return field;
        }

        detailsDiv.appendChild(
          createStyledField(
            formatWalletAddress(wallet.name),
            formatWalletAddress(wallet.public_key)
          )
        );
        container.appendChild(detailsDiv);

        const passwordContainer = document.createElement("div");
        passwordContainer.classList.add("password-container");

        const passwordInput = document.createElement("input");
        passwordInput.type = "password";
        passwordInput.placeholder = "Enter Password";
        passwordInput.classList.add("inject-input");
        passwordContainer.appendChild(passwordInput);
        container.appendChild(passwordContainer);

        window.postMessage({ type: "XTERIUM_GET_PASSWORD" }, "*");

        let storedPassword = null;
        const handlePasswordResponse = (event) => {
          if (
            event.source !== window ||
            !event.data ||
            event.data.type !== "XTERIUM_PASSWORD_RESPONSE"
          )
            return;
          if (event.data.password) {
            storedPassword = event.data.password;
            console.log("[Injected.js] Retrieved stored password:", storedPassword);
          }
        };

        window.addEventListener("message", handlePasswordResponse);

        const approveBtn = document.createElement("button");
        approveBtn.classList.add("approve-button");
        approveBtn.innerText = "Approve";
        approveBtn.addEventListener("click", () => {
          if (!passwordInput.value) {
            alert("Password is required to connect the wallet.");
            return;
          }
          if (passwordInput.value !== storedPassword) {
            alert("Invalid password. Please try again.");
            return;
          }
          document.body.removeChild(overlay);
          window.postMessage(
            { type: "XTERIUM_CONNECT_APPROVED", password: passwordInput.value },
            "*"
          );
          resolve();
        });

        const cancelBtn = document.createElement("button");
        cancelBtn.classList.add("cancel-button");
        cancelBtn.innerText = "Cancel";
        cancelBtn.addEventListener("click", () => {
          document.body.removeChild(overlay);
          reject("User cancelled wallet connection.");
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("confirmbutton-container");
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(approveBtn);
        container.appendChild(buttonContainer);
        outerContainer.appendChild(container);
        overlay.appendChild(outerContainer);
        document.body.appendChild(overlay);

        let offsetX, offsetY;
        outerContainer.addEventListener("mousedown", (e) => {
          offsetX = e.clientX - outerContainer.getBoundingClientRect().left;
          offsetY = e.clientY - outerContainer.getBoundingClientRect().top;
          const mouseMoveHandler = (moveEvent) => {
            outerContainer.style.position = 'absolute';
            outerContainer.style.left = `${moveEvent.clientX - offsetX}px`;
            outerContainer.style.top = `${moveEvent.clientY - offsetY}px`;
          };
          const mouseUpHandler = () => {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
          };
          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        });
      });
    },

    getBalance: function (publicKey) {
      return new Promise((resolve, reject) => {
        if (!window.xterium.isConnected || !window.xterium.connectedWallet) {
          console.error("[Injected.js] getBalance error: No wallet connected.");
          reject("No wallet connected.");
          return;
        }
        if (window.xterium.connectedWallet.public_key !== publicKey) {
          console.error("[Injected.js] getBalance error: Requested public key does not match the connected wallet.");
          reject("Not connected to that wallet.");
          return;
        }
        console.log(`[Injected.js] Requesting balance for ${publicKey}`);
        const handleResponse = (event) => {
          if (
            event.source !== window ||
            !event.data ||
            event.data.type !== "XTERIUM_BALANCE_RESPONSE"
          )
            return;
          if (event.data.publicKey !== publicKey) return;
          window.removeEventListener("message", handleResponse);
          if (event.data.balance !== null) {
            try {
              let balanceData = event.data.balance;
              if (typeof balanceData === "string") {
                balanceData = JSON.parse(balanceData);
              }
              let fixedBalance;
              if (Array.isArray(balanceData)) {
                fixedBalance = balanceData.map((item) => ({
                  tokenName: item.tokenName,
                  freeBalance: window.xterium.fixBalance(item.freeBalance, 12),
                  reservedBalance: window.xterium.fixBalance(item.reservedBalance, 12),
                  is_frozen: item.is_frozen
                }));
              } else if (typeof balanceData === "object") {
                fixedBalance = Object.keys(balanceData).map((token) => ({
                  tokenName: token,
                  freeBalance: window.xterium.fixBalance(balanceData[token].freeBalance, 12),
                  reservedBalance: window.xterium.fixBalance(balanceData[token].reservedBalance, 12),
                  is_frozen: balanceData[token].is_frozen
                }));
              } else {
                fixedBalance = window.xterium.fixBalance(balanceData, 12);
              }
              console.log(`[Injected.js] Balance for ${publicKey} (fixed):`, fixedBalance);
              resolve(fixedBalance);
            } catch (error) {
              console.error("[Injected.js] Error parsing balance response:", error);
              reject("Failed to parse balance data.");
            }
          } else {
            console.log(`[Injected.js] No balance found for ${publicKey}`);
            reject("No balance found.");
          }
        };
        window.addEventListener("message", handleResponse);
        console.log(`[Injected.js] Sending balance request for ${publicKey}`);
        window.postMessage({ type: "XTERIUM_GET_BALANCE", publicKey }, "*");
      });
    },

    transferInternal: function (token, recipient, value, password) {
      return new Promise((resolve, reject) => {
        if (!window.xterium.isConnected || !window.xterium.connectedWallet) {
          reject("No wallet connected. Please connect your wallet first.");
          return;
        }
        if (!token) {
          reject("Token parameter is required.");
          return;
        }
        if (!recipient || recipient.trim() === "") {
          reject("Recipient address is required.");
          return;
        }
        if (!value || isNaN(value) || Number(value) <= 0) {
          reject("Transfer value must be a positive number.");
          return;
        }
        if (!password) {
          reject("Password is required.");
          return;
        }

        const owner = window.xterium.connectedWallet.public_key;

        window.xterium
          .getBalance(owner)
          .then((balances) => {
            const userBalance = balances.find((b) => b.tokenName === token.symbol);
            if (!userBalance || userBalance.freeBalance < Number(value)) {
              reject(`Insufficient balance. Your available balance is ${userBalance ? userBalance.freeBalance : 0} ${token.symbol}.`);
              return;
            }

            console.log(`[Injected.js] Initiating transfer of ${value} ${token.symbol} from ${owner} to ${recipient}`);

            function handleTransferResponse(event) {
              if (event.source !== window || !event.data) return;
              if (event.data.type === "XTERIUM_TRANSFER_RESPONSE") {
                window.removeEventListener("message", handleTransferResponse);
                if (event.data.error) {
                  reject(event.data.error);
                } else {
                  console.log("[Injected.js] Transfer successful. Fetching updated balance...");
                  window.xterium
                    .getBalance(owner)
                    .then((updatedBalance) => {
                      console.log("[Injected.js] Updated balance:", updatedBalance);
                      window.postMessage({ type: "XTERIUM_REFRESH_BALANCE", publicKey: owner }, "*");
                      resolve(event.data.response);
                    })
                    .catch((balanceErr) => {
                      console.error("[Injected.js] Error fetching updated balance:", balanceErr);
                      reject(balanceErr);
                    });
                }
              }
            }

            window.addEventListener("message", handleTransferResponse);
            window.postMessage(
              {
                type: "XTERIUM_TRANSFER_REQUEST",
                payload: { token, owner, recipient, value, password }
              },
              "*"
            );
          })
          .catch((err) => {
            reject(`Failed to fetch balance: ${err}`);
          });
      });
    },

    transfer: function (token, recipient, value, password) {
      // Ensure token parameter exists and is correctly formatted.
      if (!token) {
        return Promise.reject("Token parameter is required.");
      }
      let tokenSymbol = "";
      if (typeof token === "string") {
        tokenSymbol = token.trim();
      } else if (token && token.symbol) {
        tokenSymbol = token.symbol;
      } else {
        return Promise.reject("Invalid token parameter. Must be a string or object with a symbol property.");
      }
      let tokenObj = { symbol: tokenSymbol, type: "Native" };

      if (window._xteriumTokenData) {
        const foundToken = window._xteriumTokenData.find(
          (t) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase()
        );
        if (foundToken) {
          tokenObj = foundToken;
        }
      }
      console.log("[Xterium] Detected token type:", tokenObj);

      // Update the transfer UI indicator if available
      if (window.xterium.updateTokenIndicator) {
        window.xterium.updateTokenIndicator(tokenObj);
      }

      return window.xterium
        .getEstimateFee(window.xterium.connectedWallet.public_key, Number(value), recipient, { token: tokenObj })
        .then((fee) => {
          const fixedFee = window.xterium.fixBalance(fee.partialFee, 12);
          console.log(`Estimated Fee: ${fixedFee}`);
          console.log("[Xterium] Transfer submitted with values:", {
            token: tokenSymbol,
            recipient: recipient,
            value: value,
            password: "****"
          });
          return window.xterium
            .transferInternal(tokenObj, recipient, Number(value), password)
            .then((res) => {
              console.log("[Xterium] Transfer successful:", res);
              return res;
            });
        })
        .catch((err) => {
          console.error("Fee estimation or transfer error:", err);
          return Promise.reject(err);
        });
    },

    showTransferringAnimation: function () {
      const overlay = document.createElement("div");
      overlay.id = "xterium-transferring-overlay";
      overlay.classList.add("transfer-animation-overlay");

      const container = document.createElement("div");
      container.classList.add("transfer-animation-container");

      const spinner = document.createElement("div");
      spinner.classList.add("spinner");
      container.appendChild(spinner);

      const text = document.createElement("div");
      text.innerText = "Transferring...";
      container.appendChild(text);

      overlay.appendChild(container);
      document.body.appendChild(overlay);
      return overlay;
    },

    updateTransferringAnimationToSuccess: function (overlay) {
      overlay.innerHTML = "";

      const container = document.createElement("div");
      container.classList.add("updatetransfer-animation-container");

      const checkContainer = document.createElement("div");
      checkContainer.classList.add("check-container");

      const checkMark = document.createElement("div");
      checkMark.classList.add("check-mark");
      checkMark.innerText = "✓";
      checkContainer.appendChild(checkMark);
      container.appendChild(checkContainer);

      const successText = document.createElement("div");
      successText.classList.add("success-text");
      successText.innerText = "Transfer Successful";
      container.appendChild(successText);

      overlay.appendChild(container);
    },

    showTransferApprovalUI: function (details) {
      return new Promise((resolve, reject) => {
        const overlay = document.createElement("div");
        overlay.id = "xterium-transfer-approval-overlay";
        overlay.classList.add("inject-overlay");

        const container = document.createElement("div");
        container.classList.add("transfer-container");

        const title = document.createElement("div");
        title.innerText = "Confirm Transfer";
        title.classList.add("inject-header");
        container.appendChild(title);

        if (details.sender && details.recipient) {
          const addressesDiv = document.createElement("div");
          addressesDiv.classList.add("transfer-address");

          const senderDiv = document.createElement("div");
          senderDiv.innerText = formatWalletAddress(details.sender);
          senderDiv.classList.add("sender-circle");

          const recipientDiv = document.createElement("div");
          recipientDiv.innerText = formatWalletAddress(details.recipient);
          recipientDiv.classList.add("recipient-circle");

          addressesDiv.appendChild(senderDiv);
          addressesDiv.appendChild(recipientDiv);
          container.appendChild(addressesDiv);
        }

        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("details-container");

        function createStyledField(label, value) {
          const field = document.createElement("div");
          field.classList.add("details-field");
          field.innerHTML = `<strong>${label}:</strong> ${value}`;
          return field;
        }

        // Update label to "Token Symbol"
        detailsDiv.appendChild(createStyledField("Token Symbol", details.token.symbol));
        detailsDiv.appendChild(
          createStyledField("Recipient", formatWalletAddress(details.recipient))
        );
        detailsDiv.appendChild(createStyledField("Amount", details.value));
        detailsDiv.appendChild(createStyledField("Fee", details.fee));
        container.appendChild(detailsDiv);

        const passwordContainer = document.createElement("div");
        passwordContainer.classList.add("password-container");

        const passwordLabel = document.createElement("label");
        passwordLabel.innerText = "Password:";
        passwordLabel.classList.add("inject-label");
        passwordContainer.appendChild(passwordLabel);

        const passwordInput = document.createElement("input");
        passwordInput.type = "password";
        passwordInput.placeholder = "Enter Password";
        passwordInput.classList.add("inject-input");
        passwordContainer.appendChild(passwordInput);

        container.appendChild(passwordContainer);

        const approveBtn = document.createElement("button");
        approveBtn.classList.add("transfer-approve-button");
        approveBtn.innerText = "Approve";
        approveBtn.addEventListener("click", () => {
          if (!passwordInput.value) {
            alert("Password is required to approve transfer.");
            return;
          }
          document.body.removeChild(overlay);
          resolve(passwordInput.value);
        });

        const cancelBtn = document.createElement("button");
        cancelBtn.classList.add("transfer-reject-button");
        cancelBtn.innerText = "Reject";
        cancelBtn.addEventListener("click", () => {
          document.body.removeChild(overlay);
          reject("User cancelled transfer.");
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("transfer-button-container");
        container.appendChild(approveBtn);
        container.appendChild(cancelBtn);

        overlay.appendChild(container);
        document.body.appendChild(overlay);
      });
    },

    showSuccessMessage: function (wallet) {
      const animationOverlay = document.createElement("div");
      animationOverlay.id = "wallet-check-animation";
      animationOverlay.style.position = "fixed";
      animationOverlay.style.top = "0";
      animationOverlay.style.left = "0";
      animationOverlay.style.width = "100%";
      animationOverlay.style.height = "100%";
      animationOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      animationOverlay.style.zIndex = "10000";
      animationOverlay.style.display = "flex";
      animationOverlay.style.justifyContent = "center";
      animationOverlay.style.alignItems = "center";

      const successContainer = document.createElement("div");
      successContainer.style.display = "flex";
      successContainer.style.flexDirection = "column";
      successContainer.style.alignItems = "center";
      successContainer.style.justifyContent = "center";
      successContainer.style.backgroundColor = "#1C3240";
      successContainer.style.borderRadius = "12px";
      successContainer.style.padding = "20px";
      successContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
      successContainer.style.opacity = "0";
      successContainer.style.transform = "scale(0.8)";

      const checkMark = document.createElement("div");
      checkMark.innerText = "✓";
      checkMark.style.color = "white";
      checkMark.style.fontSize = "50px";
      checkMark.style.fontWeight = "bold";
      checkMark.style.marginBottom = "10px";

      const connectedText = document.createElement("div");
      connectedText.innerText = "Wallet Connected";
      connectedText.style.color = "white";
      connectedText.style.fontSize = "20px";
      connectedText.style.fontWeight = "500";

      successContainer.appendChild(checkMark);
      successContainer.appendChild(connectedText);
      animationOverlay.appendChild(successContainer);
      document.body.appendChild(animationOverlay);
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
          document.body.removeChild(animationOverlay);
        }
      };

      console.log("Connected to wallet:", wallet.public_key);
    },

    disconnectWallet: function () {
      console.log("[Xterium] Disconnecting wallet...");
      window.xterium.isConnected = false;
      window.xterium.connectedWallet = null;
      const overlays = document.querySelectorAll(
        "#wallet-connect-overlay, #wallet-success-overlay, #send-receive-overlay"
      );
      overlays.forEach(
        (overlay) =>
          overlay && overlay.parentNode && overlay.parentNode.removeChild(overlay)
      );
      window.xterium.saveConnectionState();
      console.log("[Xterium] Wallet disconnected.");
    },

    getEstimateFee: async function (owner, value, recipient, balance) {
      return new Promise((resolve, reject) => {
        function handleFeeResponse(event) {
          if (event.source !== window || !event.data) return;
          if (event.data.type !== "XTERIUM_ESTIMATE_FEE_RESPONSE") return;
          if (event.data.owner !== owner) return;
          window.removeEventListener("message", handleFeeResponse);
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data.substrateFee);
          }
        }
        window.addEventListener("message", handleFeeResponse);
        window.postMessage(
          {
            type: "XTERIUM_GET_ESTIMATE_FEE",
            owner,
            value,
            recipient,
            balance
          },
          "*"
        );
      });
    },

    showExtension: function () {
      const extensionId = "jdljmhgiecpgbmellhlpdggmponadiln";
      const url = `chrome-extension://${extensionId}/popup.html`;
      window.open(url, "_blank");
      console.log("[Xterium] Extension opened in a new tab.");
    }
  };

  window.xterium.loadConnectionState();
  console.log("[Xterium] Injected Successfully!", window.xterium);
}
