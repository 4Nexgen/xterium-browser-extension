import { Storage } from "@plasmohq/storage"

export class LoginService {
    private storage = new Storage()
    private key = "userPassword"

    async login(encryptedPassword: string): Promise<boolean> {
        const existingPassword = await this.storage.get<string>(this.key)
        if (!existingPassword) {
            throw new Error("No password data found to update.")
        }

        if (encryptedPassword != existingPassword) {
            throw new Error("Password mismatched!")
        }

        return true
    }
}