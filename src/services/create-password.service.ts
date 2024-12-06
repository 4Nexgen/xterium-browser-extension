import { Storage } from "@plasmohq/storage"

export class CreatePasswordService {
    private storage = new Storage()
    private key = "userPassword"

    async createPassword(encryptedPassword: string): Promise<void> {
        await this.storage.set(this.key, JSON.stringify(encryptedPassword))
    }

    async getPassword(): Promise<string | null> {
        const storedData = await this.storage.get<string>(this.key)
        return storedData ? JSON.parse(storedData) : null
    }

    async updatePassword(encryptedPassword: string): Promise<void> {
        const existingPassword = await this.getPassword()
        if (!existingPassword) {
            throw new Error("No password data found to update.")
        }

        await this.storage.set(this.key, JSON.stringify(encryptedPassword))
    }

    async removePassword(): Promise<void> {
        await this.storage.remove(this.key)
    }
}