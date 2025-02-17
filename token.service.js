import { Storage } from "@plasmohq/storage";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { NetworkService } from "./network.service";

export class TokenService {
  constructor() {
    this.storage = new Storage({
      area: "local",
      allCopied: true,
    });
    this.storageKey = "tokens";
    this.networkService = new NetworkService();
    this.api = null;
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

  async createToken(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const existingTokens = await this.storage.get(this.storageKey);
        const tokens = existingTokens ? JSON.parse(existingTokens) : [];

        const lastId = tokens.length > 0 ? tokens[tokens.length - 1].id : 0;
        data.id = lastId + 1;

        tokens.push(data);

        await this.storage.set(this.storageKey, JSON.stringify(tokens));

        resolve("Token created successfully");
      } catch (error) {
        reject(error);
      }
    });
  }

  async getTokens() {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get(this.storageKey);

        if (!storedData) {
          return resolve([]);
        }

        const tokens = JSON.parse(storedData);
        resolve(tokens);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getTokenById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get(this.storageKey);

        if (!storedData) {
          return reject(new Error("No stored data found."));
        }
        const tokens = JSON.parse(storedData);
        const token = tokens.find((token) => token.id === id);

        if (!token) {
          return reject(new Error(`Token with id ${id} not found.`));
        }

        resolve(token);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAssetDetails(assetId) {
    if (!this.api) {
      await this.connect();
    }

    const assetIdNumber = Number(assetId);
    if (isNaN(assetIdNumber) || assetIdNumber < 0 || assetIdNumber > 2 ** 32 - 1) {
      throw new Error("Invalid assetId. Must be a valid u32.");
    }

    const metadata = await this.api.query.assets.metadata(assetIdNumber);
    const metadataDetails = metadata.toHuman();

    return {
      assetId: assetIdNumber,
      name: metadataDetails.name || "N/A",
      symbol: metadataDetails.symbol || "N/A",
      metadataDetails,
    };
  }

  async fetchAssetDetailsForTokens(tokens) {
    const updatedTokens = [...tokens];

    for (let token of updatedTokens) {
      if (token.network_id >= 1 && token.network_id <= 9) {
        try {
          const assetDetails = await this.getAssetDetails(token.network_id.toString());
          token.description = assetDetails.name;
          token.symbol = assetDetails.symbol;
          token.assetId = assetDetails.assetId;
        } catch (error) {
          console.error(`Failed to fetch details for token with network_id ${token.network_id}:`, error);
        }
      }
    }

    await this.storage.set(this.storageKey, JSON.stringify(updatedTokens));

    return updatedTokens;
  }

  async updateToken(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getTokens();

        const index = tokens.findIndex((token) => token.id === id);

        if (index === -1) {
          reject(new Error("Token not found."));
          return;
        }

        tokens[index] = data;

        await this.storage.set(this.storageKey, JSON.stringify(tokens));

        resolve("Token updated successfully");
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteToken(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getTokens();

        const filteredTokens = tokens.filter((token) => token.id !== id);

        if (tokens.length === filteredTokens.length) {
          return reject(new Error("Token not found."));
        }

        await this.storage.set(this.storageKey, JSON.stringify(filteredTokens));

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
}