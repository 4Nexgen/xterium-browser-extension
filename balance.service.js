import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { BalanceModel, SubstrateFeeModel } from "@/models/balance.model";
import { NetworkService } from "./network.service";
import { TokenService } from "./token.service";
import { WalletService } from "./wallet.service";
import { EncryptionService } from "./encryption.service";
import { Storage } from "@plasmohq/storage";

export class BalanceServices {
  constructor() {
    this.networkService = new NetworkService();
    this.walletService = new WalletService();
    this.tokenService = new TokenService();
    this.encryptionService = new EncryptionService();
    this.storage = new Storage({
      area: "local",
      allCopied: true,
    });
    this.balanceStorageKey = "wallet_balances";
    this.api = null;
  }

  async connect() {
    return new Promise(async (resolve, reject) => {
      this.networkService
        .getNetwork()
        .then(async (data) => {
          let wsUrl = data.rpc;

          if (!this.api) {
            const wsProvider = new WsProvider(wsUrl);
            const api = await ApiPromise.create({ provider: wsProvider });

            this.api = api;
          }

          resolve(this.api);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getBalancePerToken(public_key, token) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect();

        let balance = new BalanceModel();

        let freeBalance = 0;
        let reservedBalance = 0;
        let is_frozen = false;

        if (token.type === "Native") {
          const accountInfo = await this.api.query.system.account(public_key);
          const { free, reserved } = accountInfo.toJSON().data;

          freeBalance = free;
          reservedBalance = reserved;
        }

        if (token.type === "Asset") {
          const queryAssets = this.api.query.assets;
          const assetAccount = await queryAssets.account(token.network_id, public_key);
          const assetMetadata = await queryAssets.metadata(token.network_id);

          const metadata = assetMetadata?.toHuman();
          is_frozen = metadata?.is_frozen || false;

          if (assetAccount && !assetAccount.isEmpty) {
            const humanData = assetAccount.toHuman()?.balance;
            freeBalance = humanData ? parseInt(humanData.split(",").join("")) : 0;
          }
        }

        balance = {
          owner: public_key,
          token,
          freeBalance: freeBalance,
          reservedBalance: reservedBalance,
          is_frozen,
        };

        // Save balance after fetching it
        await this.saveBalance(public_key, balance);

        resolve(balance);
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveBalance(publicKey, balance) {
    return new Promise(async (resolve, reject) => {
      try {
        const walletBalances = {
          [publicKey]: balance,
        };

        await this.storage.set(this.balanceStorageKey, JSON.stringify(walletBalances));
        console.log(`[BalanceServices] Balance for ${publicKey} saved successfully.`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async getWalletBalances() {
    return new Promise(async (resolve, reject) => {
      try {
        const rawBalances = await this.storage.get(this.balanceStorageKey);
        if (!rawBalances) {
          return resolve({});
        }

        const balances = JSON.parse(rawBalances);
        resolve(balances);
      } catch (error) {
        reject(`Error fetching wallet balances: ${error.message}`);
      }
    });
  }
}
