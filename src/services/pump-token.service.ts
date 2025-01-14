import fs from 'fs';
import path from 'path';
import { PumpTokenModel } from '@/models/pump-token.model';
import PumpTokenData from "src/data/pump-tokens.json";
import { Storage } from "@plasmohq/storage"

export class PumpTokenService {
  private dataDirectory: string;

  private storage = new Storage({
    area: 'local',
    allCopied: true
  })
  private storageKey = "pump-tokens"

  constructor() {
    this.dataDirectory = path.resolve(__dirname, 'src/data/pump-token');
  }

  async getAllPumpTokens(): Promise<PumpTokenModel[]> {
    return new Promise((resolve, reject) => {
      try {
        resolve(PumpTokenData as PumpTokenModel[]);
      } catch (err) {
        console.error('Error retrieving pump tokens:', err);
        reject('Error retrieving pump tokens');
      }
    });
  }

  async getPumpTokenById(id: number): Promise<PumpTokenModel | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getAllPumpTokens();
        const token = tokens.find(token => token.id === id);
        if (token) {
          resolve(token);
        } else {
          reject('Token not found');
        }
      } catch (err) {
        reject('Error retrieving token by ID');
      }
    });
  }

  // async createToken(newToken: PumpTokenModel): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const newFilePath = path.join(this.dataDirectory, `${newToken.id}.json`);

  //     if (fs.existsSync(newFilePath)) {
  //       reject('Token with this ID already exists.');
  //       return;
  //     }

  //     fs.writeFileSync(newFilePath, JSON.stringify(newToken, null, 2), 'utf-8');
  //     resolve();
  //   });
  // }

  private async downloadPumpTokensAsJson(tokens: PumpTokenModel[]): Promise<void> {
    await this.storage.set(this.storageKey, JSON.stringify(tokens)); 
  }

  async createPumpToken(data: PumpTokenModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getAllPumpTokens();
        const lastId = tokens.length > 0 ? tokens[tokens.length - 1].id : 0;
        data.id = lastId + 1;
        tokens.push(data);
        await this.downloadPumpTokensAsJson(tokens);
        resolve("Token created and saved to JSON file");
      } catch (error) {
        reject("Failed to create token: " + error);
      }
    });
  }

  async updatePumpToken(updatedToken: PumpTokenModel): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.dataDirectory, `${updatedToken.id}.json`);

      if (!fs.existsSync(filePath)) {
        reject('Token not found.');
        return;
      }

      fs.writeFileSync(filePath, JSON.stringify(updatedToken, null, 2), 'utf-8');
      resolve();
    });
  }

  async deletePumpToken(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.dataDirectory, `${id}.json`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        resolve();
      } else {
        reject('Token not found.');
      }
    });
  }

  async listTokens(): Promise<PumpTokenModel[]> {
    return this.getAllPumpTokens();
  }

  async saveToken(token: PumpTokenModel): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const existingToken = await this.getPumpTokenById(token.id);
        if (existingToken) {
          await this.updatePumpToken(token);
        } else {
          await this.createPumpToken(token);
        }
        resolve();
      } catch (err) {
        reject('Error saving token');
      }
    });
  }
}
