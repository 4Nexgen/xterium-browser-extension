import { WalletModel } from "@/models/wallet.model"

import { Storage } from "@plasmohq/storage"

export class WalletService {
  private storage = new Storage({
    area: 'local',
    allCopied: true
  })
  private key = "wallets"

  async createWallet(data: WalletModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const existingWallets = await this.storage.get<string>(this.key)
        const wallets: WalletModel[] = existingWallets ? JSON.parse(existingWallets) : []

        const lastId = wallets.length > 0 ? wallets[wallets.length - 1].id : 0;
        data.id = lastId + 1

        wallets.push(data)

        await this.storage.set(this.key, JSON.stringify(wallets))

        resolve("Wallet created successfully")
      } catch (error) {
        reject(error)
      }
    })
  }

  async getWallets(): Promise<WalletModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key)

        if (!storedData) {
          return resolve([])
        }

        const wallets: WalletModel[] = JSON.parse(storedData)
        resolve(wallets)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getWalletById(id: number): Promise<WalletModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const storedData = await this.storage.get<string>(this.key)

        if (!storedData) {
          return reject(new Error("No stored data found."))
        }
        const wallets: WalletModel[] = JSON.parse(storedData)
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

  async updateWallet(id: number, data: WalletModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const wallets = await this.getWallets()

        const index = wallets.findIndex((wallet) => wallet.id === id)

        if (index === -1) {
          reject(new Error("Wallet not found."))
          return
        }

        wallets[index] = data

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
