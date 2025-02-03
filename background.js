chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case "OPEN_POPUP":
      chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 400,
        height: 600,
        left: Math.round(screen.width / 2 - 200),
        top: Math.round(screen.height / 2 - 300)
      });
      break;

    case "GET_WALLET_ADDRESS":
      chrome.storage.local.get(["wallet"], (result) => {
        sendResponse({
          public_key: result.wallet?.publicKey || null,
          error: result.wallet ? null : "No wallet found"
        });
      });
      return true;

    default:
      console.warn("[Xterium] Unrecognized action:", msg.action);
  }
});
