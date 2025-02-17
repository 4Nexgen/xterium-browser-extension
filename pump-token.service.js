import { ApiPromise, WsProvider } from "@polkadot/api";
import pumpTokens from "../data/pump-token/pump-tokens.json";
import { BalanceServices } from "./balance.service";
import { NetworkService } from "./network.service";

export class PumpTokenService {
  constructor() {
    this.networkService = new NetworkService();
    this.api = null;
    this.balanceService = new BalanceServices();
  }

  async connect() {
    return new Promise(async (resolve, reject) => {
      try {
        this.networkService
          .getNetwork()
          .then(async (data) => {
            let wsUrl = data.rpc;

            if (!this.api) {
              const wsProvider = new WsProvider(wsUrl);
              const api = await ApiPromise.create({ provider: wsProvider });

              this.api = api;

              resolve(this.api);
            }
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject("Failed to connect to RPC");
      }
    });
  }

  async getPumpTokens() {
    return new Promise((resolve, reject) => {
      try {
        resolve(pumpTokens);
      } catch (error) {
        reject(new Error(`Error reading JSON file: ${error.message}`));
      }
    });
  }

  async getWalletBalances() {
    return new Promise(async (resolve, reject) => {
      try {
        const rawBalances = await this.balanceService.storage.get(
          this.balanceService.balanceStorageKey
        );
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

  async getAssetDetails(assetId) {
    return new Promise(async (resolve, reject) => {
      try {
        let api = this.api;

        if (!api) {
          api = await this.connect();
          console.log("Connected to API:", api.isConnected);
        }

        const assetIdNumber = Number(assetId);
        if (isNaN(assetIdNumber) || assetIdNumber < 0 || assetIdNumber > 2 ** 32 - 1) {
          reject(new Error("Invalid assetId. Must be a valid u32."));
          return;
        }

        const asset = await api.query.assets.asset(assetIdNumber);
        const metadata = await api.query.assets.metadata(assetIdNumber);

        if (!asset || asset.isEmpty) {
          console.warn("Asset not found for ID:", assetIdNumber);
          reject(new Error("Asset not found."));
          return;
        }

        const assetDetails = asset.toHuman();
        const metadataDetails = metadata.toHuman();

        if (!assetDetails) {
          console.error("Invalid asset details format.");
          reject(new Error("Invalid asset details format."));
          return;
        }

        resolve({
          assetId: assetIdNumber,
          name: metadataDetails.name || "N/A",
          symbol: metadataDetails.symbol || "N/A",
          owner: assetDetails.owner || "N/A",
          minBalance: assetDetails.minBalance || "N/A",
          supply: assetDetails.supply || "N/A",
          assetDetails: assetDetails,
          metadataDetails,
        });
      } catch (error) {
        console.error("Error fetching asset details:", error);
        reject(error);
      }
    });
  }
}