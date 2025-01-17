import { ApiPromise, WsProvider } from "@polkadot/api"
import { Option } from "@polkadot/types"
import { hexToU8a, u8aToHex } from "@polkadot/util" // Import utilities for converting to hex (if needed)
import { blake2AsU8a } from "@polkadot/util-crypto"

import { Storage } from "@plasmohq/storage"

import { NetworkService } from "./network.service"

export class XodeService {
  private networkService = new NetworkService()
  private api: ApiPromise | null = null
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private key = "assets"

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

  async getTotalBlocks(): Promise<number | any> {
    return new Promise(async (resolve, reject) => {
      try {
        let api = this.api
        if (this.api == null) {
          api = await this.connect()
        }

        const latestBlockHash = await api.rpc.chain.getBlock()
        const totalBlocks = latestBlockHash.block.header.number.toNumber()

        resolve(totalBlocks)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getTotalAddresses(): Promise<number | any> {
    return new Promise(async (resolve, reject) => {
      try {
        let api = this.api
        if (this.api == null) {
          api = await this.connect()
        }

        const walletKeys = await api.query.system.account.keys()
        const totalAddresses = walletKeys.length

        resolve(totalAddresses)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getAssetDetails(assetId: string): Promise<any> {
    try {
      let api = this.api

      if (!api) {
        api = await this.connect()
        console.log("Connected to API:", api.isConnected)
      }

      const assetIdNumber = Number(assetId)
      if (isNaN(assetIdNumber) || assetIdNumber < 0 || assetIdNumber > 2 ** 32 - 1) {
        throw new Error("Invalid assetId. Must be a valid u32.")
      }

      const asset = await api.query.assets.asset(assetIdNumber)
      const metadata = await api.query.assets.metadata(assetIdNumber)

      if (!asset || asset.isEmpty) {
        console.warn("Asset not found for ID:", assetIdNumber)
        throw new Error("Asset not found.")
      }

      const assetDetails = asset.toHuman() as { [key: string]: any }

      const metadataDetails = metadata.toHuman() as { [key: string]: any }

      if (!assetDetails) {
        console.error("Invalid asset details format.")
        throw new Error("Invalid asset details format.")
      }

      console.log("Asset Details:", {
        assetId: assetIdNumber,
        details: assetDetails
      })

      console.log("Asset Details:", {
        assetId: assetIdNumber,
        details: metadataDetails
      })

      return {
        assetId: assetIdNumber,
        details: assetDetails,
        metadataDetails
      }
    } catch (error) {
      console.error("Error fetching asset details:", error)
      throw error
    }
  }
}
