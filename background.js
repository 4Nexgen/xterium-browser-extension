import { WalletService } from "@/services/wallet.service";
const walletService = new WalletService();

function displayWalletInfo(wallets) {
    console.log('Wallets:', wallets);  // This will help confirm if data is being passed
    wallets.forEach(wallet => {
        console.log(`Wallet ID: ${wallet.id}, Type: ${wallet.type}, Address: ${wallet.public_key}`);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getWalletAddress") {
        chrome.storage.local.get("walletAddress", (result) => {
            console.log("[Xterium] Retrieved wallet address:", result.walletAddress);
            sendResponse({ public_key: result.walletAddress || null });
        });
        return true; // Required to handle async response
    }
});