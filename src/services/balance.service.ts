import { TokenModel } from "@/models/token.model"
import { ApiPromise } from "@polkadot/api"
import type { KeyringPair } from "@polkadot/keyring/types"
import type { RuntimeDispatchInfo } from "@polkadot/types/interfaces"
import type { ISubmittableResult } from "@polkadot/types/types"
import { boolean } from "zod"

export class BalanceServices {
  async getAssetStatus(wsAPI: ApiPromise, assetId: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const assetDetails = await wsAPI.query.assets.asset(assetId)
        const parsedDetails = assetDetails.toHuman() as { status?: string } | null

        if (!parsedDetails) {
          resolve("unknown")
          return
        }

        resolve(parsedDetails.status ?? "unknown")
      } catch (error) {
        console.error("Error fetching asset status:", error)
        reject("Error fetching asset status")
      }
    })
  }

  async getBalance(
    wsAPI: ApiPromise,
    token: TokenModel,
    owner: string,
    callback: (free: string, reserved: string, status: string) => void
  ) {
    if (token.type === "Native") {
      wsAPI.query.system.account(owner, (systemAccountInfo: any) => {
        const { free, reserved } = (systemAccountInfo.toJSON() as any).data
        callback(free.toString(), reserved.toString(), "active")
      })
    }

    if (token.type === "Asset" || token.type === "Pump") {
      wsAPI.query.assets.account(token.token_id, owner, async (assetAccountInfo: any) => {
        const humanData = (assetAccountInfo.toHuman() as { [key: string]: any })?.balance
        const free = humanData ? parseInt(humanData.split(",").join("")) : 0
        const status = await this.getAssetStatus(wsAPI, token.token_id)

        callback(free.toString(), "0", status)
      })
    }
  }

  async getBalanceWithoutCallback(
    wsAPI: ApiPromise,
    token: TokenModel,
    owner: string
  ): Promise<{ free: string; reserved: string; status: string }> {
    return new Promise((resolve, reject) => {
      if (token.type === "Native") {
        wsAPI.query.system.account(owner, (systemAccountInfo: any) => {
          const { free, reserved } = (systemAccountInfo.toJSON() as any).data
          resolve({
            free: free.toString(),
            reserved: reserved.toString(),
            status: "active"
          })
        })
      }

      if (token.type === "Asset" || token.type === "Pump") {
        wsAPI.query.assets.account(token.token_id, owner, (assetAccountInfo: any) => {
          const humanData = (assetAccountInfo.toHuman() as { [key: string]: any })
            ?.balance
          const free = humanData ? parseInt(humanData.split(",").join("")) : 0
          const status = assetAccountInfo.status === "Frozen" ? "frozen" : "active"
          resolve({ free: free.toString(), reserved: "0", status })
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
    const chain = await wsAPI.rpc.system.chain()
    const chainName = chain.toString().toLowerCase()
    const isPaseo = chainName.includes("paseo")
    const isPolkadot = chainName.includes("polkadot")
  
    let dispatchInfo: RuntimeDispatchInfo | null = null
  
    const adjustedAmount = isPaseo || isPolkadot ? amount / Math.pow(10, 2) : amount
  
    if (token.type === "Native") {
      const tx = (isPaseo || isPolkadot)
        ? wsAPI.tx.balances.transferAllowDeath(recipient, adjustedAmount)
        : wsAPI.tx.balances.transfer(recipient, adjustedAmount)
  
      dispatchInfo = await tx.paymentInfo(owner)
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
      return (isPaseo || isPolkadot)
        ? Number(rawFee) / Math.pow(10, 10)
        : Number(rawFee) / Math.pow(10, 12)
    }
  
    return 0
  }  
  
  async transfer(
    wsAPI: ApiPromise,
    token: TokenModel,
    signature: KeyringPair,
    recipient: string,
    amount: number,
    onResult: (status: ISubmittableResult, txHash?: string, blockHash?: string) => void
  ): Promise<void> {
    const chain = await wsAPI.rpc.system.chain()
    const chainName = chain.toString().toLowerCase()
    const isPaseo = chainName.includes("paseo")
    const isPolkadot = chainName.includes("polkadot")
  
    const adjustedAmount = isPaseo || isPolkadot ? amount / Math.pow(10, 2) : amount
  
    const onTxResult = (result: ISubmittableResult) => {
      let txHash: string | undefined
      let blockHash: string | undefined
  
      if (result.status.isInBlock) {
        txHash = result.txHash?.toHex()
        blockHash = result.status.asInBlock.toHex()
        onResult(result, txHash, blockHash)
      } else if (result.status.isFinalized) {
        txHash = result.txHash?.toHex()
        blockHash = result.status.asFinalized.toHex()
        onResult(result, txHash, blockHash)
      } else {
        onResult(result)
      }
    }
  
    if (token.type === "Native") {
      const tx = (isPaseo || isPolkadot)
        ? wsAPI.tx.balances.transferAllowDeath(recipient, adjustedAmount)
        : wsAPI.tx.balances.transfer(recipient, adjustedAmount)
  
      tx.signAndSend(signature, onTxResult)
    }
  
    if (token.type === "Asset" || token.type === "Pump") {
      const bigIntAmount = BigInt(amount)
      const formattedAmount = wsAPI.createType("Compact<u128>", bigIntAmount)
  
      wsAPI.tx.assets
        .transfer(token.token_id, recipient, formattedAmount)
        .signAndSend(signature, onTxResult)
    }
  }  
}
