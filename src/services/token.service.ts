import { Token } from "@/models/token.model"

import { Storage } from "@plasmohq/storage"

export class TokenService {
  private storage = new Storage()
  private key = "userPassword"

  async createToken(tokenModel: Token): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const currentId =
          (await this.storage.get<number>(this.key + "_counter")) || 0
        const newId = currentId + 1

        tokenModel.id = newId

        const existingTokens = await this.storage.get<string>(this.key)
        const token: Token[] = existingTokens ? JSON.parse(existingTokens) : []

        token.push(tokenModel)

        await this.storage.set(this.key, JSON.stringify(token))
        await this.storage.set(this.key + "_counter", newId)

        resolve("Token created successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async getTokens(): Promise<Token[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key)

        if (!storedData) {
          return resolve([])
        }

        const tokens: Token[] = JSON.parse(storedData)
        resolve(tokens)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getTokenById(id: number): Promise<Token> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key)

        if (!storedData) {
          return reject(new Error("No stored data found."))
        }
        const tokens: Token[] = JSON.parse(storedData)
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

  async updateToken(id: number, updatedToken: Token): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getTokens()

        const index = tokens.findIndex((token) => token.id === id)

        if (index === -1) {
          reject(new Error("Token not found."))
          return
        }

        tokens[index] = updatedToken

        await this.storage.set(this.key, JSON.stringify(tokens))

        resolve("Token updated successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async deleteToken(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokens = await this.getTokens()

        const filteredTokens = tokens.filter((token) => token.id !== id)

        if (tokens.length === filteredTokens.length) {
          return reject(new Error("Token not found."))
        }

        await this.storage.set(this.key, JSON.stringify(filteredTokens))

        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}
