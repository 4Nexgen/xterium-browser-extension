import { PumpTokenModel } from "@/models/pump-token.model"
import { TokenModel } from "@/models/token.model"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { Storage } from "@plasmohq/storage" 
import pumpTokens from "../data/pump-token/pump-tokens.json"
import { BalanceServices } from "./balance.service"
import { NetworkService } from "./network.service"
import { WalletService } from "./wallet.service"

export class PumpTokenService {
  private walletService: WalletService
  private networkService = new NetworkService()
  private api: ApiPromise | null = null
  private balanceService: BalanceServices
  private storage = new Storage({ area: "local" })
  private balanceStorageKey = "wallet_balances"

  constructor(walletService: WalletService) {
    this.walletService = walletService
    this.balanceService = new BalanceServices(this.walletService)
  }

  async connect(): Promise<ApiPromise | null> {
    if (this.api && this.api.isConnected) {
      return this.api 
    }

    try {
      const data = await this.networkService.getNetwork()
      const wsUrl = data.rpc
      const wsProvider = new WsProvider(wsUrl)
      this.api = await ApiPromise.create({ provider: wsProvider })
      return this.api
    } catch (error) {
      console.error("Failed to connect to RPC:", error)
      throw new Error("RPC connection failed.")
    }
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

  async getPumpTokens(): Promise<TokenModel[]> {
    const pumpTokens: PumpTokenModel[] = await this.fetchPumpTokens()
    const assetTokens = pumpTokens.map(this.mapToTokenModel)
    const nativeToken = this.getDefaultToken()
    const allTokens = [nativeToken, ...assetTokens]

    console.log("[getPumpTokens] All Tokens (Native + Assets):", allTokens)
    return allTokens
  }

  private mapToTokenModel(pumpToken: PumpTokenModel): TokenModel {
    return {
      id: pumpToken.id,
      type: "Asset",
      network: pumpToken.network,
      network_id: pumpToken.network_id,
      symbol: pumpToken.symbol,
      description: pumpToken.description,
      image_url: pumpToken.image_url ?? "",
      preloaded: false,
      decimals: pumpToken.decimals
    }
  }
  private getDefaultToken(): TokenModel {
    return {
      id: 0,
      type: "Native",
      network: "Xode",
      network_id: 1,
      symbol: "XON",
      description: "XON Token",
      image_url: "",
      preloaded: true,
      decimals: 12
    }
  }

  async fetchPumpTokens(): Promise<PumpTokenModel[]> {
    try {
      const tokens = pumpTokens as unknown as PumpTokenModel[] 
      const results: PumpTokenModel[] = []

      for (const token of tokens) {
        const networkId = token.network_id

        try {
          const assetDetails = await this.getAssetDetails(networkId.toString())

          console.log("Asset Details:", assetDetails)
          console.log("Asset ID:", assetDetails.assetId)

          if (String(assetDetails.assetId) === String(networkId)) {
            results.push({
              ...token,
              symbol: assetDetails.symbol || token.symbol,
              description: assetDetails.name || token.description,
              decimals: assetDetails.decimals || token.decimals,
              marketCap: assetDetails.marketCap || token.marketCap,
              price: assetDetails.price || token.price,
              tokenCreated: new Date(assetDetails.createdAt) || token.tokenCreated
            })
          }
        } catch (innerError) {
          console.warn(
            `[fetchPumpTokens] Failed to fetch asset details for token ${token.symbol}:`,
            innerError
          )
        }
      }

      console.log("[fetchPumpTokens] Final Pump Tokens:", results)

      if (results.length > 0) {
        return results
      } else {
        throw new Error("No matching pump tokens found.")
      }
    } catch (error) {
      console.error("[fetchPumpTokens] Error processing pump tokens:", error)
      throw new Error(`[fetchPumpTokens] Error processing pump tokens: ${error.message}`)
    }
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
    Record<string, { tokenName: string; balance: number }[]>
  > {
    const rawBalances = await this.storage.get(this.balanceStorageKey)
    const balances = JSON.parse(rawBalances || "{}")
    const tokens = await this.getPumpTokens()
    const formattedBalances: Record<string, { tokenName: string; balance: number }[]> = {}

    for (const [publicKey, tokenBalances] of Object.entries(balances)) {
      if (Array.isArray(tokenBalances)) {
        formattedBalances[publicKey] = tokenBalances.map((balance: any) => {
          const token = tokens.find((t) => t.symbol === balance.tokenName)
          const decimals = token?.decimals || 12
          const rawFree = Number(balance.freeBalance)
          const displayBalance = rawFree / Math.pow(12, decimals)
          console.log(`[${balance.tokenName}] => ${displayBalance.toFixed(12)}`)

          return {
            tokenName: balance.tokenName,
            balance: Number(displayBalance.toFixed(4))
          }
        })
      }
    }

    return formattedBalances
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
