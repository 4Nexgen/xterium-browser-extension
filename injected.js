if (!window.xterium) {
  console.log("[Injected.js] Script executed!");

  window.xterium = {
    extensionId: "jdljmhgiecpgbmellhlpdggmponadiln",
    isXterium: true,
    isConnected: false,
    connectedWallet: null,

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
                  document.getElementById("walletTriggerButton")?.remove();
                  return reject("No wallets stored.");
                }
                window.xterium.showConnectPrompt(wallets)
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
                console.error("❌ [Injected.js] Error parsing wallets:", error);
                reject("❌ [Injected.js] Failed to parse wallets data.");
              }
            } else {
              reject("❌ [Injected.js] No wallets found.");
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
              console.log(`[Injected.js] Balance for ${publicKey} found:`, balanceData);
              resolve(balanceData);
            } catch (error) {
              console.error("❌ [Injected.js] Error parsing balance response:", error);
              reject("❌ [Injected.js] Failed to parse balance data.");
            }
          } else {
            console.log(`[Injected.js] No balance found for ${publicKey}`);
            reject("No balance found.");
          }
        };
        window.addEventListener("message", handleResponse);
        console.log(`[Injected.js] Sending balance request for ${publicKey}`);
        window.postMessage({ type: "XTERIUM_GET_BALANCE", publicKey: publicKey }, "*");
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

  const triggerButton = document.createElement("button");
  triggerButton.innerText = "Open Extension Popup";
  triggerButton.id = "walletTriggerButton";
  triggerButton.style.position = "fixed";
  triggerButton.style.bottom = "20px";
  triggerButton.style.right = "20px";
  triggerButton.style.padding = "10px 15px";
  triggerButton.style.zIndex = "10000";
  triggerButton.style.cursor = "pointer";
  triggerButton.style.border = "none";
  triggerButton.style.borderRadius = "4px";
  triggerButton.style.backgroundColor = "#007bff";
  triggerButton.style.color = "#fff";
  triggerButton.style.fontSize = "14px";
  triggerButton.addEventListener("click", window.xterium.showPopup);
  document.body.appendChild(triggerButton);

  console.log("[Xterium] Injected Successfully!", window.xterium);
}
