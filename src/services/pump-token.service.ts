import { PumpTokenModel } from "@/models/pump-token.model"
import { ApiPromise, WsProvider } from "@polkadot/api"

import pumpTokens from "../data/pump-token/pump-tokens.json"
import { BalanceServices } from "./balance.service"
import { NetworkService } from "./network.service"
import { WalletService } from "./wallet.service"

export class PumpTokenService {
  private networkService = new NetworkService()
  private walletService = new WalletService()
  private api: ApiPromise | null = null
  private balanceService = new BalanceServices(this.walletService)

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

  // async getPumpTokenByNetworkId(): Promise<PumpTokenModel[]> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const data = pumpTokens as unknown as PumpTokenModel[]

  //       const networkIds = data.map((token) => token.network_id)

  //       console.log(networkIds)

  //       resolve(data)
  //     } catch (error) {
  //       reject(new Error(`Error reading JSON file: ${error.message}`))
  //     }
  //   })
  // }

  async getPumpTokens(): Promise<PumpTokenModel[]> {
    return new Promise((resolve, reject) => {
      try {
        resolve(pumpTokens as unknown as PumpTokenModel[])
      } catch (error) {
        reject(new Error(`Error reading JSON file: ${error.message}`))
      }
    })
  }

  // async getPumpTokens(): Promise<PumpTokenModel[]> {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const tokens = pumpTokens as unknown as PumpTokenModel[]
  //       const results = []

  //       for (const token of tokens) {
  //         const networkId = token.network_id

  //         const assetDetails = await this.getAssetDetails(networkId.toString())

  //         console.log("details", assetDetails)
  //         console.log("assetId:", assetDetails.assetId)

  //         if (String(assetDetails.assetId) === String(networkId)) {
  //           results.push({ token, assetDetails })
  //         }
  //       }

  //       console.log("Results:", results)

  //       if (results.length > 0) {
  //         resolve(results)
  //       } else {
  //         reject(new Error("No matching assets found."))
  //       }
  //     } catch (error) {
  //       console.error("Error processing pump tokens:", error)
  //       reject(new Error(`Error processing pump tokens: ${error.message}`))
  //     }
  //   })
  // }

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

        resolve({
          assetId: assetIdNumber,
          name: metadataDetails.name || "N/A",
          symbol: metadataDetails.symbol || "N/A",
          owner: assetDetails.owner || "N/A",
          minBalance: assetDetails.minBalance || "N/A",
          supply: assetDetails.supply || "N/A",
          assetDetails: assetDetails,
          metadataDetails
        })
      } catch (error) {
        console.error("Error fetching asset details:", error)
        reject(error)
      }
    })
  }

  // async getPumpTokensWithAssetDetails(): Promise<any[]> {
  //   try {
  //     const pumpTokens = await this.getPumpTokens()

  //     const assetDetailsList: any[] = []

  //     for (const token of pumpTokens) {
  //       const networkId = token?.network_id
  //       console.log(networkId)

  //       if (!networkId) {
  //         console.warn("Network ID not found for pump token:", token)
  //         continue
  //       }

  //       try {
  //         const assetDetails = await this.getAssetDetails(networkId.toString())
  //         assetDetailsList.push(assetDetails) // Store the result
  //       } catch (error) {
  //         console.error(`Error fetching asset details for networkId ${networkId}:`, error)
  //       }
  //     }

  //     return assetDetailsList
  //   } catch (error) {
  //     console.error("Error fetching pump tokens or asset details:", error)
  //     throw error
  //   }
  // }
}
