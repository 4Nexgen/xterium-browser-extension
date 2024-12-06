import { Wallet } from "@/models/wallet.model"

import { Storage } from "@plasmohq/storage"

export class WalletService {
  private storage = new Storage()
  private key = "userPassword"

  async createWallet(walletModel: Wallet): Promise<void> {
    let currentId = (await this.storage.get<number>(this.key + "_counter")) || 0
    const newId = currentId + 1

    walletModel.id = newId

    await this.storage.set(this.key, JSON.stringify([walletModel]))
  }

  async getWallet(): Promise<Wallet[]> {
    const storedData = await this.storage.get<string>(this.key)
    return storedData ? JSON.parse(storedData) : []
  }

  async getWalletById(id: number): Promise<Wallet | null> {
    const storedData = await this.storage.get<string>(this.key)
    if (!storedData) {
      return null
    }

    const wallets: Wallet[] = JSON.parse(storedData)
    const wallet = wallets.find((wallet) => wallet.id === id)

    return wallet
  }

  async updateWallet(id: number, updatedWallet: Wallet): Promise<void> {
    const wallets = await this.getWallet()

    const index = wallets.findIndex((wallet) => wallet.id !== id)

    if (index === -1) {
      throw new Error("Wallet not found.")
    }

    wallets[index] = updatedWallet

    await this.storage.set(this.key, JSON.stringify(wallets))
  }

  async deleteWallet(id: number): Promise<void> {
    const wallets = await this.getWallet()

    const filteredWallet = wallets.filter((wallet) => wallet.id !== id)

    if (wallets.length === filteredWallet.length) {
      throw new Error("Wallet not found.")
    }

    await this.storage.set(this.key, JSON.stringify(filteredWallet))
  }
}
