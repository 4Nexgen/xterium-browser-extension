console.log("[Xterium] Injected script executed");
const hardcodedExtensionId = "jdljmhgiecpgbmellhlpdggmponadiln";

function initXterium() {
  if (!hardcodedExtensionId) {
    console.error("[Xterium] Cannot build popup URL without extension ID.");
    return;
  }

  if (!window.xterium) {
    window.xterium = {
      extensionId: hardcodedExtensionId,
      isXterium: true,

      getWalletAddressFromStorage: function () {
        return new Promise((resolve, reject) => {
          window.postMessage({ type: "XTERIUM_REQUEST", action: "GET_WALLET_ADDRESS" }, "*");
          function handler(event) {
            if (event.source !== window || !event.data || event.data.type !== "XTERIUM_RESPONSE") {
              return;
            }
            window.removeEventListener("message", handler);
            if (event.data.public_key) {
              resolve(event.data.public_key);
            } else {
              reject("No wallet found");
            }
          }
          window.addEventListener("message", handler);
        });
      },

      showPopup: function () {
        const popupUrl = `chrome-extension://${hardcodedExtensionId}/popup.html`;
        const popupWidth = 400;
        const popupHeight = 600;
        const left = Math.round(window.screen.width / 2 - popupWidth / 2);
        const top = Math.round(window.screen.height / 2 - popupHeight / 2);

        const popupWindow = window.open(
          popupUrl,
          "XteriumWalletPopup",
          `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
        );

        if (popupWindow) {
          console.log("[Xterium] Popup opened successfully.");
        } else {
          console.error("[Xterium] Failed to open popup. Check pop-up blocker settings.");
        }
      }
    };

    console.log("[Xterium] Injected Successfully!", window.xterium);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initXterium);
} else {
  initXterium();
}
