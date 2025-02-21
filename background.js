chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[Xterium] Background message received:", msg)

  switch (msg.action) {
    case "OPEN_POPUP":
      console.log("[Xterium] OPEN_POPUP action received in background.")
      break
    case "SOME_OTHER_ACTION":
      console.log("[Xterium] SOME_OTHER_ACTION message received:", msg.data)
      break
    default:
      console.warn("[Xterium] Unrecognized action in background:", msg.action)
  }
})
