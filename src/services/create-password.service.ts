import { EncryptionService } from './encryption.service';

export class CreatePasswordService {
    private key = "userPassword"
    private encryptionService: EncryptionService

    constructor() {
        this.encryptionService = new EncryptionService()
    }

    createPassword(password: string): void {
        const encryptedPassword = this.encryptionService.encrypt(password)
        localStorage.setItem(this.key, encryptedPassword)
    }

    getPassword(): string | null {
        const storedData = localStorage.getItem(this.key)
        if (storedData) {
            return this.encryptionService.decrypt(storedData) 
        }
        return null
    }

    updatePassword(password: string): void {
        const existingPassword = this.getPassword()
        if (!existingPassword) {
            throw new Error("No password data found to update.")
        }

        const encryptedPassword = this.encryptionService.encrypt(password)
        localStorage.setItem(this.key, encryptedPassword)
    }

    removePassword(): void {
        localStorage.removeItem(this.key)
    }
}
