console.log("[Xterium] Injected script executed");

if (!window.xterium) {
    window.xterium = {
        isXterium: true,

        // Function to request wallet address from background script
        getWalletAddressFromStorage: function() {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({ action: "getWalletAddress" }, response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else if (response && response.public_key) {
                        resolve(response.public_key);
                    } else {
                        reject("No wallet found");
                    }
                });
            });
        },

        showPopup: function() {
            const popupUrl = "chrome-extension://klfhdmiebenifpdmdmkjicdohjilabdg/popup.html#";
            const popupWidth = 400;
            const popupHeight = 500;
            const left = (window.screen.width / 2) - (popupWidth / 2);
            const top = (window.screen.height / 2) - (popupHeight / 2);

            const popupWindow = window.open(popupUrl, "XteriumWalletPopup", 
                `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`);

            if (popupWindow) {
                console.log("[Xterium] Popup opened successfully.");
            } else {
                console.error("[Xterium] Failed to open popup. Check pop-up blocker settings.");
            }
        }
    };
    console.log("[Xterium] Injected Successfully!", window.xterium);
}
