chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "XTERIUM_REQUEST") {
    console.log("Handling wallet request:", request);

    if (request.method === "getWalletAddress") {
      sendResponse({ result: "5CGDeeDXj9ZbYqdFK4dDQcYdTPxMAHk9mcjitbkfaF1NRd6x" });
    } else {
      sendResponse({ error: "Method not supported" });
    }
  }
  return true;
});