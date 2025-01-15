import { PumpTokenModel } from "@/models/pump-token.model"

import pumpTokens from "../data/pump-token/pump-tokens.json"

export class PumpTokenService {
  async createPumpToken(data: PumpTokenModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const lastId = pumpTokens.length > 0 ? pumpTokens[pumpTokens.length - 1].id : 0
        data.id = lastId + 1

        await this.jsonFileSave(data)

        resolve("Pupm token created successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async getPumpTokens(): Promise<PumpTokenModel[]> {
    return new Promise((resolve, reject) => {
      try {
        resolve(pumpTokens as unknown as PumpTokenModel[])
      } catch (error) {
        reject(new Error(`Error reading JSON file: ${error.message}`))
      }
    })
  }

  async jsonFileSave(data: PumpTokenModel): Promise<void> {
    try {
      if ("showDirectoryPicker" in window) {
        const directoryHandle = await (window as any).showDirectoryPicker()

        const fileHandle = await directoryHandle.getFileHandle("pump-tokens.json", {
          create: false
        })

        const file = await fileHandle.getFile()
        const text = await file.text()
        let existingData = []

        if (text) {
          existingData = JSON.parse(text)
        }

        existingData.push(data)

        const jsonData = JSON.stringify(existingData, null, 2)

        const writable = await fileHandle.createWritable()
        await writable.write(jsonData)
        await writable.close()
      } else {
        console.warn("File System Access API is not supported in this browser")
      }
    } catch (error) {
      console.error("Error saving pump token to file system", error)
    }
  }
}
