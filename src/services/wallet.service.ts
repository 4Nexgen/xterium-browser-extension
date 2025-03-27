import { WalletModel } from "@/models/wallet.model"

import { Storage } from "@plasmohq/storage"

export class WalletService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private key = "wallets"

  async getWallets(): Promise<WalletModel[]> {
    try {
      const storedData = await this.storage.get(this.key)
      if (Array.isArray(storedData)) {
        return storedData as WalletModel[]
      }

      return []
    } catch (error) {
      return []
    }
  }

  async getWallet(public_key: string): Promise<WalletModel | null> {
    const wallets = await this.getWallets()
    const wallet = wallets.find((d) => d.public_key === public_key)

    if (!wallet) {
      return null
    }

    return wallet
  }

  async createWallet(data: WalletModel): Promise<boolean> {
    const wallets = await this.getWallets()
    wallets.push(data)

    await this.storage.set(this.key, wallets)
    return true
  }

  async updateWallet(public_key: string, data: WalletModel): Promise<boolean> {
    try {
      const wallets = await this.getWallets()
      const index = wallets.findIndex((wallet) => wallet.public_key === public_key)

      if (index === -1) {
        return false
      }

      wallets[index] = {
        ...wallets[index],
        ...data
      }

      await this.storage.set(this.key, wallets)
      return true
    } catch (error) {
      return false
    }
  }

  async deleteWallet(public_key: string): Promise<boolean> {
    try {
      const wallets = await this.getWallets()
      const index = wallets.findIndex((wallet) => wallet.public_key === public_key)

      if (index === -1) {
        return false
      }

      await this.storage.set(this.key, wallets[index])
      return true
    } catch (error) {
      throw new Error(`[WalletService] Failed to delete wallet: ${error}`)
    }
  }
}
