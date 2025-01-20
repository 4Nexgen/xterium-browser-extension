import { PumpTokenModel } from "@/models/pump-token.model"
import { ApiPromise, WsProvider } from "@polkadot/api"

import pumpTokens from "../data/pump-token/pump-tokens.json"
import { BalanceServices } from "./balance.service"
import { NetworkService } from "./network.service"

export class PumpTokenService {
  private networkService = new NetworkService()
  private api: ApiPromise | null = null
  private balanceService = new BalanceServices()

  async connect(): Promise<ApiPromise | any> {
    return new Promise(async (resolve, reject) => {
      try {
        this.networkService
          .getNetwork()
          .then(async (data) => {
            let wsUrl = data.rpc

            if (!this.api) {
              const wsProvider = new WsProvider(wsUrl)
              const api = await ApiPromise.create({ provider: wsProvider })

              this.api = api

              resolve(this.api)
            }
          })
          .catch((error) => {
            reject(error)
          })
      } catch (error) {
        reject("Failed to connect to RPC")
      }
    })
  }

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

  async getWalletBalances(): Promise<
    Record<string, { publicKey: string; tokenName: string; freeBalance: number }[]>
  > {
    return new Promise(async (resolve, reject) => {
      try {
        const rawBalances = await this.balanceService.storage.get(
          this.balanceService.balanceStorageKey
        )
        if (!rawBalances) {
          return resolve({})
        }

        const balances = JSON.parse(rawBalances) as Record<
          string,
          { publicKey: string; tokenName: string; freeBalance: number }[]
        >
        resolve(balances)
      } catch (error) {
        reject(`Error fetching wallet balances: ${error.message}`)
      }
    })
  }

  async getAssetDetails(assetId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let api = this.api

        if (!api) {
          api = await this.connect()
          console.log("Connected to API:", api.isConnected)
        }

        const assetIdNumber = Number(assetId)
        if (isNaN(assetIdNumber) || assetIdNumber < 0 || assetIdNumber > 2 ** 32 - 1) {
          reject(new Error("Invalid assetId. Must be a valid u32."))
          return
        }

        const asset = await api.query.assets.asset(assetIdNumber)
        const metadata = await api.query.assets.metadata(assetIdNumber)

        if (!asset || asset.isEmpty) {
          console.warn("Asset not found for ID:", assetIdNumber)
          reject(new Error("Asset not found."))
          return
        }

        const assetDetails = asset.toHuman() as { [key: string]: any }
        const metadataDetails = metadata.toHuman() as { [key: string]: any }

        if (!assetDetails) {
          console.error("Invalid asset details format.")
          reject(new Error("Invalid asset details format."))
          return
        }

        console.log("Asset Details:", {
          assetId: assetIdNumber,
          details: assetDetails
        })

        console.log("Asset Details:", {
          assetId: assetIdNumber,
          details: metadataDetails
        })

        resolve({
          assetId: assetIdNumber,
          name: metadataDetails.name || "Unknown",
          symbol: metadataDetails.symbol || "N/A",
          owner: assetDetails.owner || "Unknown",
          assetDetails: assetDetails,
          metadataDetails
        })
      } catch (error) {
        console.error("Error fetching asset details:", error)
        reject(error)
      }
    })
  }
}
