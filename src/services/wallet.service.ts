import { WalletModel } from "@/models/wallet.model"

import { Storage } from "@plasmohq/storage"

export class WalletService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private key = "wallets"

  async createWallet(data: WalletModel): Promise<string> {
    try {
      const wallets = await this.getWallets()
      const lastId = wallets.length > 0 ? wallets[wallets.length - 1].id : 0
      data.id = lastId + 1

      // const api = await this.balanceService.connect()
      // const genesisHash = api.genesisHash.toHex()
      // const tokens = await this.getAllTokens()
      // const tokenSymbol = tokens.length > 0 ? tokens[0].symbol : "Unknown"

      // data.metaGenesisHash = genesisHash
      data.metaSource = "Xterium"
      data.tokenSymbol = "XON"

      // data.balances = await this.fetchAllBalances(data.public_key, tokens)
      wallets.push(data)
      await this.storage.set(this.key, wallets)
      return "Wallet created successfully"
    } catch (error) {
      throw new Error(`[WalletService] Failed to create wallet: ${error}`)
    }
  }
  async updateWallet(id: number, data: WalletModel): Promise<string> {
    try {
      const wallets = await this.getWallets()
      const index = wallets.findIndex((wallet) => wallet.id === id)
      if (index === -1) throw new Error("Wallet not found.")
      // const tokens = await this.getAllTokens()
      // data.balances = await this.fetchAllBalances(data.public_key, tokens)

      wallets[index] = {
        ...wallets[index],
        ...data,
        metaGenesisHash: data.metaGenesisHash || wallets[index].metaGenesisHash,
        metaSource: data.metaSource || wallets[index].metaSource,
        tokenSymbol: data.tokenSymbol || wallets[index].tokenSymbol
      }

      console.log("[WalletService] Updated wallet balances:", data.balances)

      await this.storage.set(this.key, wallets)
      return "Wallet updated successfully"
    } catch (error) {
      throw new Error(`[WalletService] Failed to update wallet: ${error}`)
    }
  }

  async getWallets(): Promise<WalletModel[]> {
    try {
      const storedData = await this.storage.get(this.key)
      if (Array.isArray(storedData)) {
        return storedData as WalletModel[]
      } else {
        console.warn(
          "[WalletService] Stored data is not an array, returning empty array."
        )
        return []
      }
    } catch (error) {
      console.error("[WalletService] Failed to get wallets:", error)
      return []
    }
  }

  async getWalletById(id: number): Promise<WalletModel> {
    const wallets = await this.getWallets()
    const wallet = wallets.find((wallet) => wallet.id === id)
    if (!wallet) throw new Error(`Wallet with id ${id} not found.`)
    return wallet
  }

  async getWalletAddress(walletId: number): Promise<string> {
    const wallet = await this.getWalletById(walletId)
    if (!wallet.public_key) throw new Error("Address not found for this wallet")
    return wallet.public_key
  }

  async deleteWallet(id: number): Promise<boolean> {
    try {
      const wallets = await this.getWallets()
      const filteredWallets = wallets.filter((wallet) => wallet.id !== id)
      if (wallets.length === filteredWallets.length) {
        throw new Error("Wallet not found.")
      }
      await this.storage.set(this.key, filteredWallets)
      return true
    } catch (error) {
      throw new Error(`[WalletService] Failed to delete wallet: ${error}`)
    }
  }
}
