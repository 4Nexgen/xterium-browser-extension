import { PumpTokenModel } from "@/models/pump-token.model";
import { Storage } from "@plasmohq/storage"

export class PumpTokenService {
  private storage = new Storage({
    area: 'local',
    allCopied: true
  })
  private storageKey = "pump-tokens"
  async createPumpToken(data: PumpTokenModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getPumpTokens();
        const lastId = tokens.length > 0 ? tokens[tokens.length - 1].id : 0;
        data.id = lastId + 1;
        tokens.push(data);
        await this.downloadTokensAsJson(tokens);
        resolve("Token created and saved to JSON file");
      } catch (error) {
        reject("Failed to create token: " + error);
      }
    });
  }

  private async downloadTokensAsJson(tokens: PumpTokenModel[]): Promise<void> {
    await this.storage.set(this.storageKey, JSON.stringify(tokens)); 
  }
  
  async getPumpTokens(): Promise<PumpTokenModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.storage.get(this.storageKey);
        resolve(tokens ? JSON.parse(tokens) : []);
      } catch (error) {
        reject("Failed to retrieve tokens: " + error);
      }
    });
  }

  async updatePumpToken(id: number, data: PumpTokenModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getPumpTokens();
        const index = tokens.findIndex((token) => token.id === id);
        if (index === -1) throw new Error("Token not found.");
        tokens[index] = { ...tokens[index], ...data, id }; 
        await this.downloadTokensAsJson(tokens);
        resolve("Token updated and saved to JSON file");
      } catch (error) {
        reject("Failed to update token: " + error);
      }
    });
  }

  async deletePumpToken(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getPumpTokens();
        const filteredTokens = tokens.filter((token) => token.id !== id);
        if (tokens.length === filteredTokens.length) throw new Error("Token not found.");
        await this.downloadTokensAsJson(filteredTokens);
        resolve(true); 
      } catch (error) {
        reject("Failed to delete token: " + error);
      }
    });
  }
}
