import { WalletModel } from "@/models/wallet.model";
import { BalanceModel } from "@/models/balance.model";
import { TokenModel } from "@/models/token.model";
import { Storage } from "@plasmohq/storage";
import { BalanceServices } from "./balance.service";
import { PumpTokenService } from "./pump-token.service";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { NetworkService } from "./network.service";
export class WalletService {
  private storage = new Storage({
    area: "local",
    allCopied: true,
  });
  private networkService = new NetworkService();
  private key = "wallets";
  private pumpTokenService = new PumpTokenService(this);
  private balanceService: BalanceServices;

  constructor() {
    this.balanceService = new BalanceServices(this);
  }

  async createWallet(data: WalletModel): Promise<string> {
    try {
      const wallets = await this.getWallets();
      const lastId = wallets.length > 0 ? wallets[wallets.length - 1].id : 0;
      data.id = lastId + 1;

  
      const tokens = await this.pumpTokenService.fetchPumpTokens();
      data.balances = await Promise.all(
        tokens.map((token) =>
          this.getBalanceForToken(data.public_key, token).catch((err) => {
            console.warn(
              `[WalletService] Error fetching balance for ${token.symbol}:`,
              err
            );
            return this.getDefaultBalance(token);
          })
        ) 
      );

      console.log("[WalletService] Created wallet with balances:", data.balances);
      wallets.push(data);
      await this.storage.set(this.key, JSON.stringify(wallets));
      return "Wallet created successfully";
    } catch (error) {
      throw new Error(`[WalletService] Failed to create wallet: ${error}`);
    }
  }

  async updateWallet(id: number, data: WalletModel): Promise<string> {
    try {
      const wallets = await this.getWallets();
      const index = wallets.findIndex((wallet) => wallet.id === id);
      if (index === -1) throw new Error("Wallet not found.");

      // Refresh balances using the new getBalanceForToken method
      const tokens = await this.pumpTokenService.getPumpTokens();
      data.balances = await Promise.all(
        tokens.map((token) =>
          this.getBalanceForToken(data.public_key, token).catch((err) => {
            console.warn(
              `[WalletService] Error fetching balance for ${token.symbol}:`,
              err
            );
            return this.getDefaultBalance(token);
          })
        )
      );

      console.log("[WalletService] Updated wallet balances:", data.balances);
      wallets[index] = data;
      await this.storage.set(this.key, JSON.stringify(wallets));
      return "Wallet updated successfully";
    } catch (error) {
      throw new Error(`[WalletService] Failed to update wallet: ${error}`);
    }
  }
  async getWallets(): Promise<WalletModel[]> {
    try {
      const storedData = await this.storage.get<string>(this.key);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("[WalletService] Failed to get wallets:", error);
      return [];
    }
  }

  async getWalletById(id: number): Promise<WalletModel> {
    const wallets = await this.getWallets();
    const wallet = wallets.find((wallet) => wallet.id === id);
    if (!wallet) throw new Error(`Wallet with id ${id} not found.`);
    return wallet;
  }
  async getWalletAddress(walletId: number): Promise<string> {
    const wallet = await this.getWalletById(walletId);
    if (!wallet.public_key) throw new Error("Address not found for this wallet");
    return wallet.public_key;
  }

  async getBalances(walletId: number): Promise<BalanceModel[]> {
    const wallet = await this.getWalletById(walletId);
    if (!wallet.balances) {
      console.warn("[WalletService] No balances found, initializing default");
      wallet.balances = [this.getDefaultBalance()];
    }
    return wallet.balances;
  }
  async deleteWallet(id: number): Promise<boolean> {
    try {
      const wallets = await this.getWallets();
      const filteredWallets = wallets.filter((wallet) => wallet.id !== id);
      if (wallets.length === filteredWallets.length) {
        throw new Error("Wallet not found.");
      }
      await this.storage.set(this.key, JSON.stringify(filteredWallets));
      return true;
    } catch (error) {
      throw new Error(`[WalletService] Failed to delete wallet: ${error}`);
    }
  }

  async getBalanceForToken(public_key: string, token: TokenModel): Promise<BalanceModel> {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure the API connection is established
        await this.connect();

        let freeBalance = 0;
        let reservedBalance = 0;
        let is_frozen = false;

        if (token.type === "Native") {
          const accountInfo = await this.api.query.system.account(public_key);
          const { free, reserved } = (accountInfo.toJSON() as any).data;
          freeBalance = free;
          reservedBalance = reserved;
        }

        if (token.type === "Asset") {
          const queryAssets = this.api.query.assets;
          const assetAccount = await queryAssets.account(token.network_id, public_key);
          const assetMetadata = await queryAssets.metadata(token.network_id);
          const metadata = assetMetadata?.toHuman() as { [key: string]: any };
          is_frozen = metadata?.is_frozen || false;
          if (assetAccount && !assetAccount.isEmpty) {
            const humanData = (assetAccount.toHuman() as { [key: string]: any })?.balance;
            freeBalance = humanData ? parseInt(humanData.split(",").join("")) : 0;
          }
        }

        const balance: BalanceModel = {
          owner: public_key,
          token,
          freeBalance,
          reservedBalance,
          is_frozen,
        };

        console.log("[WalletService] Retrieved balance:", balance);

        // Save the balance to storage (ensure saveBalance is implemented appropriately)
        await this.saveBalance(public_key, [
          {
            tokenName: token.symbol,
            freeBalance,
            reservedBalance,
            is_frozen,
          },
        ]);

        resolve(balance);
      } catch (error) {
        reject(error);
      }
    });
  }


  // ── Updated: Fetch Balances for All Tokens Using the New getBalancePerToken ──
  private async fetchAllBalances(
    publicKey: string,
    tokens: TokenModel[]
  ): Promise<BalanceModel[]> {
    const balanceRequests = tokens.map(async (token) => {
      try {
        return await this.balanceService.getBalancePerToken(publicKey, token);
      } catch (err) {
        console.warn(`[WalletService] Failed to fetch balance for ${token.symbol}:`, err);
        return this.getDefaultBalance(token);
      }
    });
    return Promise.all(balanceRequests);
  }

  // ── Merged Default Balance Function ──
  private getDefaultBalance(token?: TokenModel): BalanceModel {
    return {
      freeBalance: 0,
      reservedBalance: 0,
      owner: "",
      token: token ? token : this.getDefaultToken(),
      is_frozen: false,
    };
  }

  private getDefaultToken(): TokenModel {
    return {
      id: 0,
      type: "Native",
      network: "Xode",
      network_id: 1,
      symbol: "XON",
      description: "XON Token",
      image_url: "",
      preloaded: false,
      decimals: 12,
    };
  }

async saveBalance(
  publicKey: string,
  balances: { tokenName: string; freeBalance: number; reservedBalance: number; is_frozen: boolean }[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("wallet_balances", (data) => {
      try {
        const storedBalances = data.wallet_balances || {};
        const existingBalances = storedBalances[publicKey] || [];

        // Format each balance so that freeBalance and reservedBalance are fixed to 8 decimals.
        const formattedBalances = balances.map((b) => {
          let free = b.freeBalance;
          let reserved = b.reservedBalance;
          if (isNaN(free)) free = 0;
          if (isNaN(reserved)) reserved = 0;
          return {
            tokenName: b.tokenName,
            freeBalance: parseFloat(free.toFixed(8)),
            reservedBalance: parseFloat(reserved.toFixed(8)),
            is_frozen: b.is_frozen,
          };
        });

        // Merge new balances with existing ones
        for (const newBalance of formattedBalances) {
          const tokenIndex = existingBalances.findIndex(
            (b: any) => b.tokenName === newBalance.tokenName
          );
          if (tokenIndex > -1) {
            existingBalances[tokenIndex] = newBalance;
          } else {
            existingBalances.push(newBalance);
          }
        }

        storedBalances[publicKey] = existingBalances;

        chrome.storage.local.set({ wallet_balances: storedBalances }, () => {
          console.log("[BalanceService] Balances saved (formatted):", storedBalances);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  });
  
}
private api: ApiPromise = null;

  async connect(): Promise<ApiPromise | null> {
    if (this.api && this.api.isConnected) {
      return this.api; // Return existing connection if available
    }
  
    try {
      const data = await this.networkService.getNetwork();
      const wsUrl = data.rpc;
      const wsProvider = new WsProvider(wsUrl);
      this.api = await ApiPromise.create({ provider: wsProvider });
      return this.api;
    } catch (error) {
      console.error("Failed to connect to RPC:", error);
      throw new Error("RPC connection failed.");
    }
  }}
