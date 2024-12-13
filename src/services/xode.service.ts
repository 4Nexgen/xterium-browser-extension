import { ApiPromise, WsProvider } from "@polkadot/api"

export class XodeService {
  private api: ApiPromise | null = null
  private readonly wsUrl = "wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc"

  async connect(): Promise<ApiPromise | any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.api) {
          const wsProvider = new WsProvider(this.wsUrl)
          this.api = await ApiPromise.create({ provider: wsProvider })
        }

        resolve(this.api)
      } catch (error) {
        reject("Failed to connect to RPC")
      }
    })
  }

  async getTotalBlocks(): Promise<number | any> {
    return new Promise(async (resolve, reject) => {
      try {
        const api = await this.connect()
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
        const api = await this.connect()
        const walletKeys = await api.query.system.account.keys()
        const totalAddresses = walletKeys.length

        resolve(totalAddresses)
      } catch (error) {
        reject(error)
      }
    })
  }
}
