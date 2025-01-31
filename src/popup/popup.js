document.addEventListener("DOMContentLoaded", async () => {
  const walletDisplay = document.getElementById("walletAddress");

  // Fetch wallet address from storage
  chrome.runtime.sendMessage({ action: "getWalletAddress" }, (response) => {
      if (response && response.public_key) {
          walletDisplay.textContent = `Wallet Address: ${response.public_key}`;
      } else {
          walletDisplay.textContent = "No wallet found.";
      }
  });

  // Close popup button
  document.getElementById("closePopup").addEventListener("click", () => {
      window.close();
  });
});
