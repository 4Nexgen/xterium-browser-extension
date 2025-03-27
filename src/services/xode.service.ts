import type { ApiPromise } from "@polkadot/api"

export class XodeService {
  async getTotalBlocks(wsAPI: ApiPromise): Promise<number> {
    const latestBlockHash = await wsAPI.rpc.chain.getBlock()
    const totalBlocks = latestBlockHash.block.header.number.toNumber()
    return totalBlocks
  }

  async getTotalAddresses(wsAPI: ApiPromise): Promise<number> {
    const walletKeys = await wsAPI.query.system.account.keys()
    const totalAddresses = walletKeys.length
    return totalAddresses
  }
}
