import { WalletModel } from "@/models/wallet.model";
import { BalanceModel } from "@/models/balance.model";
import { TokenModel } from "@/models/token.model";
import { Storage } from "@plasmohq/storage";
import { BalanceServices } from "./balance.service";

export class WalletService {
  private storage = new Storage({
    area: "local",
    allCopied: true,
  });
  private key = "wallets";
  private balanceService: BalanceServices;
  constructor() {
    this.balanceService = new BalanceServices(this);
  }

  async createWallet(data: WalletModel): Promise<string> {
    try {
      const wallets = await this.getWallets();
      const lastId = wallets.length > 0 ? wallets[wallets.length - 1].id : 0;
      data.id = lastId + 1;
      const tokens = await this.getAllTokens();
      data.balances = await this.fetchAllBalances(data.public_key, tokens);

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
      const tokens = await this.getAllTokens();
      data.balances = await this.fetchAllBalances(data.public_key, tokens);

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
  public async fetchWalletBalances(): Promise<WalletModel[]> {
    try {
      const wallets = await this.getWallets();
      const results: WalletModel[] = [];

      if (wallets.length === 0) {
        console.warn("[WalletService] No wallets found.");
        return [];
      }
      const tokens = await this.getAllTokens();

      for (const wallet of wallets) {
        const publicKey = wallet.public_key;

        try {
          const balances = await Promise.all(
            tokens.map(async (token) => {
              try {
                return await this.balanceService.getBalancePerToken(publicKey, token);
              } catch (balanceError) {
                console.warn(`[fetchWalletBalances] Balance error for ${token.symbol}:`, balanceError);
                return this.createDefaultBalance(token);
              }
            })
          );
          results.push({
            ...wallet,
            balances,
          });

          console.log(`[fetchWalletBalances] Wallet ${wallet.id} balances:`, balances);
        } catch (innerError) {
          console.warn(`[fetchWalletBalances] Error fetching balances for wallet ${wallet.id}:`, innerError);
        }
      }

      console.log("[fetchWalletBalances] All Wallet Balances (Native + Assets):", results);
      return results;
    } catch (error) {
      console.error("[fetchWalletBalances] Failed to fetch wallet balances:", error);
      throw new Error(`[fetchWalletBalances] Failed: ${error.message}`);
    }
  }
  private async fetchAllBalances(publicKey: string, tokens: TokenModel[]): Promise<BalanceModel[]> {
    const balanceRequests = tokens.map(async (token) => {
      try {
        return await this.balanceService.getBalancePerToken(publicKey, token);
      } catch (err) {
        console.warn(`[WalletService] Failed to fetch balance for ${token.symbol}:`, err);
        return this.createDefaultBalance(token);
      }
    });
    const balances = await Promise.all(balanceRequests);
    const formattedBalances = balances.map(b => ({
      tokenName: b.token.symbol,
      freeBalance: b.freeBalance,
      reservedBalance: b.reservedBalance,
      is_frozen: b.is_frozen
    }));
    await this.balanceService.saveBalance(publicKey, formattedBalances);

    return balances;
  }

  private getDefaultBalance(): BalanceModel {
    return {
      freeBalance: 0,
      reservedBalance: 0,
      owner: "",
      token: this.getDefaultToken(),
      is_frozen: false,
    };
  }
  private createDefaultBalance(token: TokenModel): BalanceModel {
    return {
      freeBalance: 0,
      reservedBalance: 0,
      owner: "",
      token,
      is_frozen: false,
    };
  }
  private async getAllTokens(): Promise<TokenModel[]> {
    const tokens: TokenModel[] = [this.getDefaultToken()];
    try {
      const api = await this.balanceService.connect();
      const assetEntries = await api.query.assets.metadata.entries();
      assetEntries.forEach(([key, metadata]) => {
        const assetId = parseInt(key.args[0].toString());
        const metaHuman = metadata.toHuman() as { name?: string; symbol?: string; decimals?: string };
        const token: TokenModel = {
          id: assetId,
          type: "Asset",
          network: this.getDefaultToken().network,
          network_id: assetId,
          symbol: metaHuman?.symbol || `Asset ${assetId}`,
          description: metaHuman?.name || `Asset Token ${assetId}`,
          image_url: "",
          preloaded: false,
          decimals: metaHuman?.decimals ? parseInt(metaHuman.decimals) : 12,
        };
        tokens.push(token);
      });
      console.log("[WalletService] Fetched tokens:", tokens);
    } catch (error) {
      console.warn("[WalletService] Failed to fetch asset tokens from RPC:", error);
    }
    return tokens;
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
}
