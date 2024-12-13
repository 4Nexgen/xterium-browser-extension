import { EncryptionService } from './encryption.service';
import { Storage } from '@plasmohq/storage';

export class UserService {
    private storage = new Storage({
        area: 'local',
        allCopied: true
    })
    private storageKey = "user"
    private lastAccessTimeKey = "user_last_access_time"
    private encryptionService = new EncryptionService()

    async createPassword(password: string): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                const encryptedPassword = this.encryptionService.encrypt(password, password);
                await this.storage.setItem(this.storageKey, encryptedPassword);

                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }

    async login(password: string): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                const encryptedPassword = await this.storage.getItem(this.storageKey);
                if (!encryptedPassword) {
                    reject("No password found in storage.")
                }

                let isMatched = false
                const decryptedPassword = this.encryptionService.decrypt(password, encryptedPassword);
                if (decryptedPassword === password) {
                    isMatched = true;
                }

                resolve(isMatched)
            } catch (error) {
                reject(error)
            }
        })
    }

    async logout(): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.storage.remove(this.lastAccessTimeKey);
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }

    async isUserExists(): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                const storedData = await this.storage.getItem(this.storageKey);
                if (storedData != null) {
                    resolve(true)
                }

                resolve(false)
            } catch (error) {
                reject(error)
            }
        })
    }

    async setLastAccessTime(time: string): Promise<boolean | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const storedData = await this.storage.setItem(this.lastAccessTimeKey, time);
                if (storedData != null) {
                    resolve(true)
                }

                resolve(null)
            } catch (error) {
                reject(error)
            }
        })
    }

    async getLastAccessTime(): Promise<string | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const storedData = await this.storage.getItem(this.lastAccessTimeKey);
                if (storedData != null) {
                    resolve(storedData)
                }

                resolve(null)
            } catch (error) {
                reject(error)
            }
        })
    }

    async getPassword(password: string): Promise<string | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const encryptedPassword = await this.storage.getItem(this.storageKey);
                if (!encryptedPassword) {
                    reject("No password found in storage.")
                }

                const decryptedPassword = this.encryptionService.decrypt(password, encryptedPassword);
                if (decryptedPassword === password) {
                    resolve(decryptedPassword)
                }

                resolve(null)
            } catch (error) {
                reject(error)
            }
        })
    }

    async updatePassword(password: string): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                const encryptedPassword = this.encryptionService.encrypt(password, password);
                await this.storage.setItem(this.storageKey, encryptedPassword);

                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }

    async removePassword(): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.storage.removeItem(this.storageKey);
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
}
