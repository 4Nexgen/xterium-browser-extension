import { ApiPromise, Keyring, WsProvider } from "@polkadot/api"
import { Storage } from "@plasmohq/storage"

import { NetworkModel } from "@/models/network.model"

export class NetworkService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private storageKey = "network"

  async getNetwork(): Promise<NetworkModel | null> {
    const storedData = await this.storage.get<string>(this.storageKey)

    if (!storedData) {
      return null
    }

    const network: NetworkModel = JSON.parse(storedData)
    return network
  }

  async setNetwork(data: NetworkModel): Promise<boolean> {
    await this.storage.set(this.storageKey, JSON.stringify(data))
    return true
  }

  async connectRPC(rpc: string): Promise<ApiPromise | null> {
    const wsUrl = rpc
    const wsProvider = new WsProvider(wsUrl)
    return await ApiPromise.create({ provider: wsProvider })
  }
}
