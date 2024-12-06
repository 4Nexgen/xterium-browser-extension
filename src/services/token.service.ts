import { Token } from "@/models/token.model"

import { Storage } from "@plasmohq/storage"

export class TokenService {
  private storage = new Storage()
  private key = "userPassword"

  async createToken(tokenModel: Token): Promise<void> {
    let currentId = (await this.storage.get<number>(this.key + "_counter")) || 0
    const newId = currentId + 1

    tokenModel.id = newId

    await this.storage.set(this.key, JSON.stringify([tokenModel]))
  }

  async getTokens(): Promise<Token[]> {
    const storedData = await this.storage.get<string>(this.key)
    return storedData ? JSON.parse(storedData) : []
  }

  async getTokenById(id: number): Promise<Token | null> {
    const storedData = await this.storage.get<string>(this.key)
    if (!storedData) {
      return null
    }

    const tokens: Token[] = JSON.parse(storedData)
    const token = tokens.find((token) => token.id === id)

    return token
  }

  async updateToken(id: number, updatedToken: Token): Promise<void> {
    const tokens = await this.getTokens()

    const index = tokens.findIndex((token) => token.id !== id)

    if (index === -1) {
      throw new Error("Token not found.")
    }

    tokens[index] = updatedToken

    await this.storage.set(this.key, JSON.stringify(tokens))
  }

  async deleteToken(id: number): Promise<void> {
    const tokens = await this.getTokens()

    const filteredToken = tokens.filter((token) => token.id !== id)

    if (tokens.length === filteredToken.length) {
      throw new Error("Token not found.")
    }

    await this.storage.set(this.key, JSON.stringify(filteredToken))
  }
}
