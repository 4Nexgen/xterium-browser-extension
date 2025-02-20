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
        connectedWallet: this.connectedWallet,
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
            if (event.source !== window || !event.data || event.data.type !== "XTERIUM_WALLETS_RESPONSE") return;
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
                  window.xterium.showPopup();
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
        const promptOverlay = document.createElement("div");
        promptOverlay.id = "wallet-connect-overlay";
        promptOverlay.style.position = "fixed";
        promptOverlay.style.top = "0";
        promptOverlay.style.left = "0";
        promptOverlay.style.width = "100%";
        promptOverlay.style.height = "100%";
        promptOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        promptOverlay.style.zIndex = "10000";
        promptOverlay.style.display = "flex";
        promptOverlay.style.justifyContent = "center";
        promptOverlay.style.alignItems = "center";

        const promptContainer = document.createElement("div");
        promptContainer.style.backgroundColor = "#fff";
        promptContainer.style.padding = "20px";
        promptContainer.style.borderRadius = "8px";
        promptContainer.style.textAlign = "center";
        promptContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

        const promptMessage = document.createElement("p");
        promptMessage.innerText = "Please select a wallet to connect:";
        promptMessage.style.marginBottom = "20px";
        promptContainer.appendChild(promptMessage);

        const walletList = document.createElement("ul");
        walletList.style.listStyleType = "none";
        walletList.style.padding = "0";

        wallets.forEach((wallet) => {
          const walletItem = document.createElement("li");
          walletItem.style.marginBottom = "10px";

          const walletButton = document.createElement("button");
          walletButton.innerText = wallet.public_key;
          walletButton.style.padding = "10px 15px";
          walletButton.style.backgroundColor = "#4CAF50";
          walletButton.style.color = "#fff";
          walletButton.style.border = "none";
          walletButton.style.borderRadius = "4px";
          walletButton.style.cursor = "pointer";
          walletButton.addEventListener("click", () => {
            document.body.removeChild(promptOverlay);
            window.xterium.showSuccessMessage(wallet);
            resolve(wallet);
          });

          walletItem.appendChild(walletButton);
          walletList.appendChild(walletItem);
        });

        const cancelButton = document.createElement("button");
        cancelButton.innerText = "Cancel";
        cancelButton.style.padding = "10px 15px";
        cancelButton.style.backgroundColor = "#f44336";
        cancelButton.style.color = "#fff";
        cancelButton.style.border = "none";
        cancelButton.style.borderRadius = "4px";
        cancelButton.style.cursor = "pointer";
        cancelButton.style.marginTop = "20px";
        cancelButton.addEventListener("click", () => {
          document.body.removeChild(promptOverlay);
          reject("User cancelled wallet connection.");
        });

        promptContainer.appendChild(walletList);
        promptContainer.appendChild(cancelButton);
        promptOverlay.appendChild(promptContainer);
        document.body.appendChild(promptOverlay);
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
          if (event.source !== window || !event.data || event.data.type !== "XTERIUM_BALANCE_RESPONSE") return;
          if (event.data.publicKey !== publicKey) return;
          window.removeEventListener("message", handleResponse);
          if (event.data.balance !== null) {
            try {
              let balanceData = event.data.balance;
              if (typeof balanceData === "string") balanceData = JSON.parse(balanceData);
              let fixedBalance;
              if (Array.isArray(balanceData)) {
                fixedBalance = balanceData.map(item => ({
                  tokenName: item.tokenName,
                  freeBalance: window.xterium.fixBalance(item.freeBalance, 12),
                  reservedBalance: window.xterium.fixBalance(item.reservedBalance, 12),
                  is_frozen: item.is_frozen
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
        if (!window.xterium.isConnected || !window.xterium.connectedWallet) {
          reject("No wallet connected.");
          return;
        }
        const owner = window.xterium.connectedWallet.public_key;
        console.log(
          `[Injected.js] Initiating transfer of ${value} for token ${token.symbol} from ${owner} to ${recipient}`
        );

        function handleTransferResponse(event) {
          if (event.source !== window || !event.data) return;
          if (event.data.type === "XTERIUM_TRANSFER_RESPONSE") {
            window.removeEventListener("message", handleTransferResponse);
            if (event.data.error) {
              reject(event.data.error);
            } else {
              resolve(event.data.response);
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
      });
    },

    transfer: function (token, recipient, value, password) {
      if (arguments.length === 0) {
        return window.xterium.showTransferUI();
      } else {
        return window.xterium.transferInternal(token, recipient, value, password);
      }
    },

    showTransferUI: function () {
      return new Promise((resolve, reject) => {
        window.postMessage({ type: "XTERIUM_GET_TOKEN_LIST" }, "*");
        const handleTokenListResponse = (event) => {
          if (event.source !== window || !event.data) return;
          if (event.data.type !== "XTERIUM_TOKEN_LIST_RESPONSE") return;
          window.removeEventListener("message", handleTokenListResponse);
          const tokenData = event.data.tokenList || [];
          console.log("[Injected.js] Token list from extension storage:", tokenData);
          // Store token data globally for token detection
          window._xteriumTokenData = tokenData;
          createTransferUI(tokenData);
        };
        window.addEventListener("message", handleTokenListResponse);
        const createTransferUI = (tokenData) => {
          const overlay = document.createElement("div");
          overlay.id = "xterium-transfer-overlay";
          overlay.style.position = "fixed";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
          overlay.style.zIndex = "10000";
          overlay.style.display = "flex";
          overlay.style.justifyContent = "center";
          overlay.style.alignItems = "center";

          const container = document.createElement("div");
          container.style.backgroundColor = "#fff";
          container.style.padding = "20px";
          container.style.borderRadius = "8px";
          container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
          container.style.width = "300px";
          container.style.textAlign = "center";

          const title = document.createElement("h3");
          title.innerText = "Transfer Tokens";
          container.appendChild(title);

          const errorMsg = document.createElement("div");
          errorMsg.style.color = "red";
          errorMsg.style.marginBottom = "10px";
          errorMsg.style.display = "none";
          container.appendChild(errorMsg);

          const detectedInfo = document.createElement("div");
          detectedInfo.style.fontSize = "0.9em";
          detectedInfo.style.marginBottom = "10px";
          detectedInfo.style.color = "#333";
          detectedInfo.innerText = "Detected as: Native (default)";
          container.appendChild(detectedInfo);

          const feeDisplay = document.createElement("div");
          feeDisplay.style.color = "#555";
          feeDisplay.style.marginBottom = "10px";
          feeDisplay.innerText = "Estimated Fee: Calculating...";
          container.appendChild(feeDisplay);

          const form = document.createElement("form");
          form.id = "xterium-transfer-form";

          const tokenLabel = document.createElement("label");
          tokenLabel.innerText = "Token Symbol:";
          tokenLabel.style.display = "block";
          form.appendChild(tokenLabel);

          const tokenInput = document.createElement("input");
          tokenInput.type = "text";
          tokenInput.name = "token";
          tokenInput.required = true;
          tokenInput.style.width = "100%";
          tokenInput.style.marginBottom = "10px";
          form.appendChild(tokenInput);

          const recipientLabel = document.createElement("label");
          recipientLabel.innerText = "Recipient:";
          recipientLabel.style.display = "block";
          form.appendChild(recipientLabel);

          const recipientInput = document.createElement("input");
          recipientInput.type = "text";
          recipientInput.name = "recipient";
          recipientInput.required = true;
          recipientInput.style.width = "100%";
          recipientInput.style.marginBottom = "10px";
          form.appendChild(recipientInput);

          const valueLabel = document.createElement("label");
          valueLabel.innerText = "Value (smallest unit):";
          valueLabel.style.display = "block";
          form.appendChild(valueLabel);

          const valueInput = document.createElement("input");
          valueInput.type = "number";
          valueInput.name = "value";
          valueInput.required = true;
          valueInput.style.width = "100%";
          valueInput.style.marginBottom = "10px";
          form.appendChild(valueInput);

          const passwordLabel = document.createElement("label");
          passwordLabel.innerText = "Password:";
          passwordLabel.style.display = "block";
          form.appendChild(passwordLabel);

          const passwordInput = document.createElement("input");
          passwordInput.type = "password";
          passwordInput.name = "password";
          passwordInput.required = true;
          passwordInput.style.width = "100%";
          passwordInput.style.marginBottom = "10px";
          form.appendChild(passwordInput);

          const submitButton = document.createElement("button");
          submitButton.type = "submit";
          submitButton.innerText = "Transfer";
          submitButton.style.padding = "10px 15px";
          submitButton.style.backgroundColor = "#4CAF50";
          submitButton.style.color = "#fff";
          submitButton.style.border = "none";
          submitButton.style.borderRadius = "4px";
          submitButton.style.cursor = "pointer";
          form.appendChild(submitButton);

          const cancelButton = document.createElement("button");
          cancelButton.type = "button";
          cancelButton.innerText = "Cancel";
          cancelButton.style.padding = "10px 15px";
          cancelButton.style.backgroundColor = "#f44336";
          cancelButton.style.color = "#fff";
          cancelButton.style.border = "none";
          cancelButton.style.borderRadius = "4px";
          cancelButton.style.cursor = "pointer";
          cancelButton.style.marginLeft = "10px";
          cancelButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            reject("User cancelled transfer.");
          });
          form.appendChild(cancelButton);

          container.appendChild(form);
          overlay.appendChild(container);
          document.body.appendChild(overlay);

          console.log("[Xterium] Transfer UI shown.");

          let tokenDetectTimeout = null;
          tokenInput.addEventListener("input", function () {
            clearTimeout(tokenDetectTimeout);
            tokenDetectTimeout = setTimeout(() => {
              detectTokenType(tokenInput.value.trim());
            }, 500);
          });

          function detectTokenType(tokenVal) {
            if (!tokenVal) {
              detectedInfo.innerText = "Detected as: Native (default)";
              return;
            }
            if (!window._xteriumTokenData) {
              detectedInfo.innerText = "Detected as: Native (default)";
              return;
            }
            const foundToken = window._xteriumTokenData.find(
              (t) => t.symbol.toUpperCase() === tokenVal.toUpperCase()
            );
            if (foundToken) {
              if (foundToken.type === "Asset") {
                detectedInfo.innerText = `Detected as: Asset on ${foundToken.network} (Network ID: ${foundToken.network_id})`;
              } else {
                detectedInfo.innerText = `Detected as: Native` +
                  (foundToken.network ? ` on ${foundToken.network}` : " (default)");
              }
            } else {
              detectedInfo.innerText = "Detected as: Native (default)";
            }
            console.log("[Xterium] Detected token type:", detectedInfo.innerText);
          }

          let feeTimeout = null;
          tokenInput.addEventListener("input", updateEstimatedFee);
          recipientInput.addEventListener("input", updateEstimatedFee);
          valueInput.addEventListener("input", updateEstimatedFee);

          function updateEstimatedFee() {
            clearTimeout(feeTimeout);
            feeTimeout = setTimeout(async () => {
              const tokenSymbol = tokenInput.value.trim();
              const recipientVal = recipientInput.value.trim();
              const valueVal = valueInput.value.trim();
              if (!tokenSymbol || !recipientVal || !valueVal) {
                feeDisplay.innerText = "Estimated Fee: Enter details first...";
                return;
              }
              let foundToken = window._xteriumTokenData.find(
                (t) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase()
              );
              let tokenObj = foundToken
                ? { ...foundToken }
                : { symbol: tokenSymbol, type: "Native" };
              try {
                const fee = await window.xterium.getEstimateFee(
                  window.xterium.connectedWallet.public_key,
                  Number(valueVal),
                  recipientVal,
                  { token: tokenObj }
                );
                // Format the fee using fixBalance and display only the total fee.
                const fixedFee = window.xterium.fixBalance(fee.partialFee, 12);
                feeDisplay.innerText = `Estimated Fee: ${fixedFee}`;
              } catch (error) {
                console.error("[Xterium] Fee estimation error:", error);
                feeDisplay.innerText = "Error calculating fee";
              }
            }, 500);
          }

          form.addEventListener("submit", function (e) {
            e.preventDefault();
            errorMsg.style.display = "none";
            const tokenValue = tokenInput.value.trim();
            const recipientValue = recipientInput.value.trim();
            const valueValue = valueInput.value.trim();
            const passwordValue = passwordInput.value.trim();
            console.log("[Xterium] Transfer form submitted with values:", {
              token: tokenValue,
              recipient: recipientValue,
              value: valueValue,
              password: "****", // Do not log the actual password
              detected: detectedInfo.innerText
            });
            let foundToken = window._xteriumTokenData.find(
              (t) => t.symbol.toUpperCase() === tokenValue.toUpperCase()
            );
            let tokenObj = foundToken
              ? { ...foundToken }
              : { symbol: tokenValue, type: "Native" };
            console.log("[Xterium] Final token object:", tokenObj);
            tokenInput.disabled = true;
            recipientInput.disabled = true;
            valueInput.disabled = true;
            passwordInput.disabled = true;
            submitButton.disabled = true;
            cancelButton.disabled = true;
            window.xterium
              .transferInternal(tokenObj, recipientValue, Number(valueValue), passwordValue)
              .then((res) => {
                console.log("[Xterium] Transfer successful:", res);
                document.body.removeChild(overlay);
                resolve(res);
              })
              .catch((err) => {
                console.error("[Xterium] Transfer error:", err);
                errorMsg.innerText = "Transfer error: " + err;
                errorMsg.style.display = "block";
                tokenInput.disabled = false;
                recipientInput.disabled = false;
                valueInput.disabled = false;
                passwordInput.disabled = false;
                submitButton.disabled = false;
                cancelButton.disabled = false;
                reject(err);
              });
          });
        };
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

      const checkContainer = document.createElement("div");
      checkContainer.style.width = "100px";
      checkContainer.style.height = "100px";
      checkContainer.style.borderRadius = "50%";
      checkContainer.style.backgroundColor = "#4CAF50";
      checkContainer.style.display = "flex";
      checkContainer.style.justifyContent = "center";
      checkContainer.style.alignItems = "center";
      checkContainer.style.opacity = "0";
      checkContainer.style.transform = "scale(0.5)";

      const checkMark = document.createElement("div");
      checkMark.innerText = "✓";
      checkMark.style.color = "white";
      checkMark.style.fontSize = "50px";
      checkContainer.appendChild(checkMark);

      animationOverlay.appendChild(checkContainer);
      document.body.appendChild(animationOverlay);

      checkContainer.animate(
        [
          { opacity: 0, transform: "scale(0.5)" },
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
      const overlays = document.querySelectorAll("#wallet-connect-overlay, #wallet-success-overlay, #send-receive-overlay");
      overlays.forEach((overlay) => overlay && overlay.parentNode && overlay.parentNode.removeChild(overlay));
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
        window.postMessage({
          type: "XTERIUM_GET_ESTIMATE_FEE",
          owner,
          value,
          recipient,
          balance
        }, "*");
      });
    },
    showPopup: function () {
      if (document.getElementById("xterium-popup-overlay")) return;
      document.body.style.overflow = "auto";
      const overlay = document.createElement("div");
      overlay.id = "xterium-popup-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0,0,0,0.0)";
      overlay.style.zIndex = "10000";
      overlay.style.pointerEvents = "none";

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.width = "450px";
      container.style.height = "600px";
      container.style.bottom = "20px";
      container.style.right = "20px";
      container.style.backgroundColor = "#fff";
      container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
      container.style.borderRadius = "8px";
      container.style.pointerEvents = "auto";
      container.style.overflow = "hidden";

      const closeBtn = document.createElement("button");
      closeBtn.innerText = "X";
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "10px";
      closeBtn.style.right = "10px";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.border = "none";
      closeBtn.style.background = "transparent";
      closeBtn.style.fontSize = "18px";
      closeBtn.style.color = "#333";
      closeBtn.addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.style.overflow = "";
      });

      const iframe = document.createElement("iframe");
      iframe.src = `chrome-extension://${window.xterium.extensionId}/popup.html`;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.overflow = "hidden";

      container.appendChild(closeBtn);
      container.appendChild(iframe);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
      console.log("[Xterium] Popup overlay opened.");
    }

   
    };

  window.xterium.loadConnectionState();
  console.log("[Xterium] Injected Successfully!", window.xterium);
}
