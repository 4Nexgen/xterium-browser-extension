import { ApiPromise, WsProvider } from "@polkadot/api"

export class XodeService {
  private api: ApiPromise | null = null
  private isConnected: boolean = false

  async connectToApi(wsUrl: string): Promise<ApiPromise> {
    if (!this.api) {
      const wsProvider = new WsProvider(wsUrl)
      this.api = await ApiPromise.create({ provider: wsProvider })
    }
    return this.api
  }

  async getTotalBlocks(): Promise<number | any> {
    return new Promise(async (resolve, reject) => {
      try {
        const api = await this.connectToApi(
          "wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc"
        )

        const latestBlockHash = await api.rpc.chain.getBlock()
        const totalBlocks = latestBlockHash.block.header.number.toNumber()

        resolve(totalBlocks)
      } catch (error) {
        reject(`Error getting total blocks: ${error.message}`)
      }
    })
  }

  async getTotalAddresses(): Promise<number | any> {
    return new Promise(async (resolve, reject) => {
      try {
        const api = await this.connectToApi(
          "wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc"
        )

        const walletKeys = await api.query.system.account.keys()
        const totalAddresses = walletKeys.length

        resolve(totalAddresses)
      } catch (error) {
        reject(`Error getting total addresses: ${error.message}`)
      }
    })
  }
}
