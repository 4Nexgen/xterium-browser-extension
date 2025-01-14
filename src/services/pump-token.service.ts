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

        await this.savePumpTokenToFileSystem(data)

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

  async savePumpTokenToFileSystem(data: PumpTokenModel): Promise<void> {
    try {
      if ("showDirectoryPicker" in window) {
        const directoryHandle = await (window as any).showDirectoryPicker()

        const fileHandle = await directoryHandle.getFileHandle(`${data.name}.json`, {
          create: true
        })

        const writable = await fileHandle.createWritable()

        await writable.write(JSON.stringify(data, null, 2))

        await writable.close()

        console.log("Pump token saved to file system")
      } else {
        console.warn("File System Access API is not supported in this browser")
      }
    } catch (error) {
      console.error("Error saving pump token to file system", error)
    }
  }
}
