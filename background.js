chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log("[Xterium] Message received:", msg);
  switch (msg.action) {
    case "OPEN_POPUP":
      console.log("[Xterium] (OLD BEHAVIOR) Would open popup in new window.");
      break;
    default:
      console.warn("[Xterium] Unrecognized action:", msg.action);
  }
});
