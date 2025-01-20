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
}
