import type { ApiPromise } from "@polkadot/api"

export class XodeService {
  async getTotalBlocks(wsAPI: ApiPromise, callback: (totalBlocks: number) => void) {
    const latestBlockHash = await wsAPI.rpc.chain.getBlock()
    const totalBlocks = latestBlockHash.block.toHuman()["header"]["number"];
    callback(parseInt(totalBlocks.replace(/,/g, '')))
  }

  async getTotalAddresses(wsAPI: ApiPromise, callback: (totalAddresses: number) => void) {
    const walletKeys = await wsAPI.query.system.account.keys()
    const totalAddresses = walletKeys.length
    callback(totalAddresses)
  }
}
