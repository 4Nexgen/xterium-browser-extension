import { PumpTokenModel } from "@/models/pump-token.model"

import { Storage } from "@plasmohq/storage"

export class PumpTokenService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private key = "pump-tokens"

  async createPumpToken(data: PumpTokenModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const existingPumpTokens = await this.storage.get<string>(this.key)
        const pumpTokens: PumpTokenModel[] = existingPumpTokens
          ? JSON.parse(existingPumpTokens)
          : []

        const lastId = pumpTokens.length > 0 ? pumpTokens[pumpTokens.length - 1].id : 0
        data.id = lastId + 1

        pumpTokens.push(data)

        await this.storage.set(this.key, JSON.stringify(pumpTokens))

        const jsonData = JSON.stringify(pumpTokens, null, 2)

        const blob = new Blob([jsonData], { type: "application/json" })
        const fileName = "pumptoken.json"
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = fileName

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        resolve("Pupm token created successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async getPumpTokens(): Promise<PumpTokenModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key)

        if (!storedData) {
          return resolve([])
        }

        const pumpTokens: PumpTokenModel[] = JSON.parse(storedData)
        resolve(pumpTokens)
      } catch (error) {
        reject(error)
      }
    })
  }
}
