import { BalanceModel, SubstrateFeeModel } from "@/models/balance.model"
import type { TokenModel } from "@/models/token.model"
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api"

import { Storage } from "@plasmohq/storage"

import { EncryptionService } from "./encryption.service"
import { NetworkService } from "./network.service"
import { TokenService } from "./token.service"
import { WalletService } from "./wallet.service"

export class BalanceServices {
  private networkService = new NetworkService()
  private tokenService = new TokenService()
  private encryptionService = new EncryptionService()
  public storage = new Storage({
    area: "local",
    allCopied: true
  })
  public balanceStorageKey = "wallet_balances"
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  private api: ApiPromise = null

  async connect(): Promise<ApiPromise | null> {
    if (this.api && this.api.isConnected) {
      console.log("[BalanceServices] API already connected.")
      return this.api
    }
    console.log("[BalanceServices] Connecting to RPC...")
    try {
      const data = await this.networkService.getNetwork()
      const wsUrl = data.rpc
      const wsProvider = new WsProvider(wsUrl)
      this.api = await ApiPromise.create({ provider: wsProvider })
      console.log("[BalanceServices] API connected successfully.")
      return this.api
    } catch (error) {
      console.error("[BalanceServices] Failed to connect to RPC:", error)
      throw new Error("RPC connection failed.")
    }
  }
  async parseAndSaveTokens(): Promise<void> {
    try {
      const tokens: TokenModel[] = await this.tokenService.getTokens()
      const updatedTokens = await this.tokenService.fetchAssetDetailsForTokens(tokens)
      await this.storage.set("token_list", JSON.stringify(updatedTokens))
      window.localStorage.setItem("token_list", JSON.stringify(updatedTokens))
    } catch (error) {
      console.error("[BalanceServices] Error saving token list:", error)
      throw error
    }
  }

  async getBalancePerToken(public_key: string, token: TokenModel): Promise<BalanceModel> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token || typeof token !== "object") {
          throw new Error("Invalid token object.")
        }

        if (
          token.type === "Asset" &&
          (token.network_id === undefined || token.network_id === null)
        ) {
          const tokenList = await this.tokenService.getTokens()
          const foundToken = tokenList.find((t) => t.symbol === token.symbol)

          if (!foundToken || foundToken.network_id === undefined) {
            throw new Error(`Invalid or missing network_id for token: ${token.symbol}`)
          }

          token.network_id = foundToken.network_id
        }

        await this.parseAndSaveTokens()
        await this.connect()

        let balance: BalanceModel = new BalanceModel()
        let freeBalance = 0
        let reservedBalance = 0
        let is_frozen = false

        if (token.type === "Native") {
          const accountInfo = await this.api.query.system.account(public_key)
          const { free, reserved } = (accountInfo.toJSON() as any).data

          freeBalance = free
          reservedBalance = reserved
        }

        if (token.type === "Asset") {
          const queryAssets = this.api.query.assets

          const assetId = Number(token.network_id)
          if (isNaN(assetId)) {
            throw new Error(`Invalid asset ID: ${token.network_id}`)
          }

          if (!public_key || public_key.length !== 48) {
            throw new Error(`Invalid account ID: ${public_key}`)
          }

          const assetAccount = await queryAssets.account(assetId, public_key)
          const assetMetadata = await queryAssets.metadata(assetId)

          const metadata = assetMetadata?.toHuman() as { [key: string]: any }
          is_frozen = metadata?.is_frozen || false

          if (assetAccount && !assetAccount.isEmpty) {
            const humanData = (assetAccount.toHuman() as { [key: string]: any })?.balance
            freeBalance = humanData ? parseInt(humanData.split(",").join("")) : 0
          }
        }

        balance = {
          owner: public_key,
          token,
          freeBalance: freeBalance,
          reservedBalance: reservedBalance,
          is_frozen
        }

        await this.saveBalance(public_key, [
          {
            tokenName: token.symbol,
            freeBalance: freeBalance,
            reservedBalance: reservedBalance,
            is_frozen: is_frozen
          }
        ])

        resolve(balance)
      } catch (error) {
        console.error("[BalanceService] Failed to fetch balance:", error)
        reject(error)
      }
    })
  }

  async getEstimateFee(
    owner: string,
    value: number,
    recipient: string,
    balance: BalanceModel
  ): Promise<SubstrateFeeModel> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect()
        const amount = BigInt(value)

        let info
        if (balance.token.type === "Native") {
          info = await this.api?.tx.balances
            .transfer(recipient, amount)
            .paymentInfo(owner)
        } else if (balance.token.type === "Asset") {
          info = await this.api?.tx.assets
            .transfer(balance.token.network_id, recipient, amount)
            .paymentInfo(owner)
        }

        if (info) {
          const substrateFee: SubstrateFeeModel = {
            feeClass: info.class.toString(),
            weight: info.weight.toString(),
            partialFee: info.partialFee.toString()
          }
          resolve(substrateFee)
        } else {
          reject(new Error("Transaction info is null or undefined."))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async transfer(
    owner: string,
    value: number,
    recipient: string,
    password: string
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect()
        const amount = BigInt(value)

        const wallets = await this.walletService.getWallets()
        if (wallets.length === 0) {
          return reject("No wallets available")
        }

        for (const wallet of wallets) {
          if (owner === wallet.public_key) {
            try {
              const decryptedMnemonicPhrase = this.encryptionService.decrypt(
                password,
                wallet.mnemonic_phrase
              )
              const keyring = new Keyring({ type: "sr25519" })
              const signature = keyring.addFromUri(decryptedMnemonicPhrase)

              await this.api.tx.balances
                .transferAllowDeath(recipient, amount)
                .signAndSend(signature, (result) => {
                  if (result.status.isFinalized) {
                    resolve(true)
                  } else if (result.isError) {
                    reject("Transaction failed")
                  }
                })

              return
            } catch (error) {
              return reject(`Error during transaction: ${error.message}`)
            }
          }
        }

        reject("No valid wallet found")
      } catch (error) {
        reject(`Unexpected error: ${error.message}`)
      }
    })
  }

  async transferAssets(
    owner: string,
    assetId: number,
    value: number,
    recipient: string,
    password: string
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect()
        const amount = BigInt(value)

        const wallets = await this.walletService.getWallets()
        if (wallets.length === 0) {
          return reject("No wallets available")
        }

        for (const wallet of wallets) {
          if (owner === wallet.public_key) {
            try {
              const decryptedMnemonicPhrase = this.encryptionService.decrypt(
                password,
                wallet.mnemonic_phrase
              )

              const keyring = new Keyring({ type: "sr25519" })
              const signature = keyring.addFromUri(decryptedMnemonicPhrase)
              const formattedAmount = this.api.createType("Compact<u128>", amount)

              await this.api.tx.assets
                .transfer(assetId, recipient, formattedAmount)
                .signAndSend(signature, (result) => {
                  if (result.status.isFinalized) {
                    resolve(true)
                  } else if (result.isError) {
                    reject("Transaction failed")
                  }
                })

              return
            } catch (error) {
              return reject(`Error during transaction: ${error.message}`)
            }
          }
        }

        reject("No valid wallet found")
      } catch (error) {
        reject(`Unexpected error: ${error.message}`)
      }
    })
  }

  async saveBalance(
    publicKey: string,
    balances: {
      tokenName: string
      freeBalance: number
      reservedBalance: number
      is_frozen: boolean
    }[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("wallet_balances", (data) => {
        try {
          const storedBalances = data.wallet_balances || {}
          const existingBalances = storedBalances[publicKey] || []
          const formattedBalances = balances.map((b) => {
            let free = b.freeBalance
            let reserved = b.reservedBalance
            if (isNaN(free)) free = 0
            if (isNaN(reserved)) reserved = 0
            return {
              tokenName: b.tokenName,
              freeBalance: parseFloat(free.toFixed(8)),
              reservedBalance: parseFloat(reserved.toFixed(8)),
              is_frozen: b.is_frozen
            }
          })
          for (const newBalance of formattedBalances) {
            const tokenIndex = existingBalances.findIndex(
              (b: any) => b.tokenName === newBalance.tokenName
            )
            if (tokenIndex > -1) {
              existingBalances[tokenIndex] = newBalance
            } else {
              existingBalances.push(newBalance)
            }
          }

          storedBalances[publicKey] = existingBalances
          chrome.storage.local.set({ wallet_balances: storedBalances }, () => {
            resolve()
          })
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}
