import { Wallet } from "@/models/wallet.model"

import { Storage } from "@plasmohq/storage"

export class WalletService {
  private storage = new Storage()
  private key = "userPassword"

  async createWallet(walletModel: Wallet): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const currentId =
          (await this.storage.get<number>(this.key + "_counter")) || 0
        const newId = currentId + 1

        walletModel.id = newId

        const existingWallets = await this.storage.get<string>(this.key)
        const wallet: Wallet[] = existingWallets
          ? JSON.parse(existingWallets)
          : []

        wallet.push(walletModel)

        await this.storage.set(this.key, JSON.stringify(wallet))
        await this.storage.set(this.key + "_counter", newId)

        resolve("Wallet created successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async getWallets(): Promise<Wallet[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key)

        if (!storedData) {
          return resolve([])
        }

        const wallets: Wallet[] = JSON.parse(storedData)
        resolve(wallets)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getWalletById(id: number): Promise<Wallet> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key)

        if (!storedData) {
          return reject(new Error("No stored data found."))
        }
        const wallets: Wallet[] = JSON.parse(storedData)
        const wallet = wallets.find((wallet) => wallet.id === id)

        if (!wallet) {
          return reject(new Error(`Wallet with id ${id} not found.`))
        }

        resolve(wallet)
      } catch (error) {
        reject(error)
      }
    })
  }

  async updateWallet(id: number, updatedWallet: Wallet): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets()

        const index = wallets.findIndex((wallet) => wallet.id === id)

        if (index === -1) {
          reject(new Error("Wallet not found."))
          return
        }

        wallets[index] = updatedWallet

        await this.storage.set(this.key, JSON.stringify(wallets))

        resolve("Wallet updated successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async deleteWallet(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets()

        const filteredWallets = wallets.filter((wallet) => wallet.id !== id)

        if (wallets.length === filteredWallets.length) {
          return reject(new Error("Wallet not found."))
        }

        await this.storage.set(this.key, JSON.stringify(filteredWallets))

        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}
