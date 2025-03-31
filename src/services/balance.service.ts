import { TokenModel } from "@/models/token.model"
import { ApiPromise } from "@polkadot/api"
import type { KeyringPair } from "@polkadot/keyring/types"
import type { RuntimeDispatchInfo } from "@polkadot/types/interfaces"
import type { ISubmittableResult } from "@polkadot/types/types"
import { boolean } from "zod"

export class BalanceServices {
  getBalance(
    wsAPI: ApiPromise,
    token: TokenModel,
    owner: string,
    callback: (free: string, reserved: string, frozen: boolean) => void
  ) {
    if (token.type === "Native") {
      wsAPI.query.system.account(owner, (systemAccountInfo: any) => {
        const { free, reserved } = (systemAccountInfo.toJSON() as any).data
        callback(free.toString(), reserved.toString(), false)
      })
    }

    if (token.type === "Asset" || token.type === "Pump") {
      wsAPI.query.assets.account(token.token_id, owner, (assetAccountInfo: any) => {
        const humanData = (assetAccountInfo.toHuman() as { [key: string]: any })?.balance
        const free = humanData ? parseInt(humanData.split(",").join("")) : 0
        const status = assetAccountInfo.status
        const frozen = status === "Frozen"
        callback(free.toString(), "0", frozen)
      })
    }
  }

  async getBalanceWithoutCallback(
    wsAPI: ApiPromise,
    token: TokenModel,
    owner: string
  ): Promise<{ free: string; reserved: string; frozen: boolean }> {
    return new Promise((resolve, reject) => {
      if (token.type === "Native") {
        wsAPI.query.system.account(owner, (systemAccountInfo: any) => {
          const { free, reserved } = (systemAccountInfo.toJSON() as any).data
          resolve({ free: free.toString(), reserved: reserved.toString(), frozen: false })
        })
      }

      if (token.type === "Asset" || token.type === "Pump") {
        wsAPI.query.assets.account(token.token_id, owner, (assetAccountInfo: any) => {
          const humanData = (assetAccountInfo.toHuman() as { [key: string]: any })
            ?.balance
          const free = humanData ? parseInt(humanData.split(",").join("")) : 0
          const status = assetAccountInfo.status
          const frozen = status === "Frozen"
          resolve({ free: free.toString(), reserved: "0", frozen })
        })
      }
    })
  }

  async getEstimateTransferFee(
    wsAPI: ApiPromise,
    token: TokenModel,
    owner: string,
    recipient: string,
    amount: number
  ): Promise<number> {
    let dispatchInfo: RuntimeDispatchInfo | null = null

    if (token.type === "Native") {
      dispatchInfo = await wsAPI.tx.balances
        .transfer(recipient, amount)
        .paymentInfo(owner)
    }

    if (token.type === "Asset" || token.type === "Pump") {
      const assetId = token.token_id
      const bigIntAmount = BigInt(amount)
      const formattedAmount = wsAPI.createType("Compact<u128>", bigIntAmount)

      dispatchInfo = await wsAPI.tx.assets
        .transfer(assetId, recipient, formattedAmount)
        .paymentInfo(owner)
    }

    if (dispatchInfo !== null) {
      const rawFee = BigInt(dispatchInfo.partialFee.toString())
      return Number(rawFee) / Math.pow(10, 12)
    }

    return 0
  }

  async transfer(
    wsAPI: ApiPromise,
    token: TokenModel,
    signature: KeyringPair,
    recipient: string,
    amount: number,
    onResult: (status: ISubmittableResult) => void
  ): Promise<void> {
    if (token.type === "Native") {
      wsAPI.tx.balances
        .transferAllowDeath(recipient, amount)
        .signAndSend(signature, (result) => {
          onResult(result)
        })
    }

    if (token.type === "Asset" || token.type === "Pump") {
      const bigIntAmount = BigInt(amount)
      const formattedAmount = wsAPI.createType("Compact<u128>", bigIntAmount)

      wsAPI.tx.assets
        .transfer(token.token_id, recipient, formattedAmount)
        .signAndSend(signature, (result) => {
          onResult(result)
        })
    }
  }
}
