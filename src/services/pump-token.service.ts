import { PumpTokenModel } from "@/models/pump-token.model"
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
        const existingTokens = await this.storage.get<string>(this.storageKey)
        const tokens: PumpTokenModel[] = existingTokens ? JSON.parse(existingTokens) : []

        const lastId = tokens.length > 0 ? tokens[tokens.length - 1].id : 0;
        data.id = lastId + 1

        tokens.push(data)

        await this.storage.set(this.storageKey, JSON.stringify(tokens))

        resolve("Token created successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async getPumpTokens(): Promise<PumpTokenModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.storageKey)

        if (!storedData) {
          return resolve([])
        }

        const tokens: PumpTokenModel[] = JSON.parse(storedData)
        resolve(tokens)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getPumpTokenById(id: number): Promise<PumpTokenModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.storageKey)

        if (!storedData) {
          return reject(new Error("No stored data found."))
        }
        const tokens: PumpTokenModel[] = JSON.parse(storedData)
        const token = tokens.find((token) => token.id === id)

        if (!token) {
          return reject(new Error(`Token with id ${id} not found.`))
        }

        resolve(token)
      } catch (error) {
        reject(error)
      }
    })
  }

  async updatePumpToken(id: number, data: PumpTokenModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getPumpTokens()

        const index = tokens.findIndex((token) => token.id === id)

        if (index === -1) {
          reject(new Error("Token not found."))
          return
        }

        tokens[index] = data

        await this.storage.set(this.storageKey, JSON.stringify(tokens))

        resolve("Token updated successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async deletePumpToken(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getPumpTokens()

        const filteredTokens = tokens.filter((token) => token.id !== id)

        if (tokens.length === filteredTokens.length) {
          return reject(new Error("Token not found."))
        }

        await this.storage.set(this.storageKey, JSON.stringify(filteredTokens))

        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}
