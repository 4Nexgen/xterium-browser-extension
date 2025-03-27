import { Storage } from "@plasmohq/storage"

import { EncryptionService } from "./encryption.service"
import { HashService } from "./hash.service"

export class UserService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private storageKey = "user"
  private storageAccessTimeKey = "user_access_time"

  private hashService = new HashService()

  async isUserExists(): Promise<boolean> {
    const storedData = await this.storage.getItem(this.storageKey)
    if (storedData != null) {
      return true
    }

    return false
  }

  async createPassword(password: string): Promise<boolean> {
    const inputHashedPassword = this.hashService.hash(password)
    await this.storage.setItem(this.storageKey, inputHashedPassword)
    return true
  }

  async login(password: string): Promise<boolean> {
    const hashedPassword = await this.storage.getItem(this.storageKey)
    if (!hashedPassword) {
      return false
    }

    const inputHashedPassword = this.hashService.hash(password)
    if (inputHashedPassword === hashedPassword) {
      return true
    }
  }

  async logout(): Promise<boolean> {
    await this.storage.remove(this.storageAccessTimeKey)
    return true
  }

  async setAccessTime(time: string): Promise<boolean> {
    const storedData = await this.storage.setItem(this.storageAccessTimeKey, time)
    if (storedData != null) {
      return true
    }

    return false
  }

  async getAccessTime(): Promise<string> {
    const storedData = await this.storage.getItem(this.storageAccessTimeKey)
    if (storedData != null) {
      return storedData
    }

    return ""
  }

  async updatePassword(password: string): Promise<boolean> {
    const inputHashedPassword = this.hashService.hash(password)
    await this.storage.setItem(this.storageKey, inputHashedPassword)
    return true
  }

  async removePassword(): Promise<boolean> {
    await this.storage.removeItem(this.storageKey)
    return true
  }
}
