import { WalletModel } from "@/models/wallet.model";
import { BalanceModel } from "@/models/balance.model";
import { AddressModel } from "@/models/address.model";
import { TokenModel } from "@/models/token.model";  // ✅ Ensure this is imported
import { Storage } from "@plasmohq/storage";

export class WalletService {
  private storage = new Storage({
    area: 'local',
    allCopied: true
  });
  private key = "wallets";

  async createWallet(data: WalletModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const existingWallets = await this.storage.get<string>(this.key);
        const wallets: WalletModel[] = existingWallets ? JSON.parse(existingWallets) : [];

        const lastId = wallets.length > 0 ? wallets[wallets.length - 1].id : 0;
        data.id = lastId + 1;

        wallets.push(data);
        await this.storage.set(this.key, JSON.stringify(wallets));

        resolve("Wallet created successfully");
      } catch (error) {
        reject(error);
      }
    });
  }

  async getWallets(): Promise<WalletModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key);

        if (!storedData) {
          return resolve([]);
        }

        const wallets: WalletModel[] = JSON.parse(storedData);
        resolve(wallets);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getWalletById(id: number): Promise<WalletModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets();
        const wallet = wallets.find((wallet) => wallet.id === id);

        if (!wallet) {
          return reject(new Error(`Wallet with id ${id} not found.`));
        }

        resolve(wallet);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getBalances(walletId: number): Promise<BalanceModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets();
        const wallet = wallets.find(w => w.id === walletId);

        if (!wallet) {
          reject(new Error("Wallet not found"));
          return;
        }

        if (!wallet.balances) {
          console.warn("[WalletService] No balances found, initializing default");
          wallet.balances = this.getDefaultBalance();  // ✅ Uses default balance function
        }

        resolve(wallet.balances);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getWalletAddress(walletId: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets();
        const wallet = wallets.find((w) => w.id === walletId);

        if (!wallet) {
          reject(new Error("Wallet not found"));
          return;
        }

        if (!wallet.public_key) {
          reject(new Error("Address not found for this wallet"));
          return;
        }

        resolve(wallet.public_key);
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateWallet(id: number, data: WalletModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets();
        const index = wallets.findIndex((wallet) => wallet.id === id);

        if (index === -1) {
          reject(new Error("Wallet not found."));
          return;
        }

        wallets[index] = data;
        await this.storage.set(this.key, JSON.stringify(wallets));

        resolve("Wallet updated successfully");
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteWallet(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets();
        const filteredWallets = wallets.filter((wallet) => wallet.id !== id);

        if (wallets.length === filteredWallets.length) {
          return reject(new Error("Wallet not found."));
        }

        await this.storage.set(this.key, JSON.stringify(filteredWallets));

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  // ✅ New function: Returns a default balance object
  private getDefaultBalance(): BalanceModel {
    return {
      freeBalance: 0,
      reservedBalance: 0,
      owner: "", // Replace with a valid owner
      token: this.getDefaultToken(),  // ✅ Uses a proper TokenModel
      is_frozen: false,
    };
  }

  private getDefaultToken(): TokenModel {
    return {
      id: 0,
      type: "default", 
      network: "default", 
      network_id: 1,  
      symbol: "DTK",  
      description: "Default Token",
      image_url: "", 
      preloaded: false,
    };
  }
}