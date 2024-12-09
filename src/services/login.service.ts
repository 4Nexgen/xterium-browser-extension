import { EncryptionService } from './encryption.service';

export class LoginService {
    private encryptionService: EncryptionService;

    constructor() {
        this.encryptionService = new EncryptionService();
    }

    login(userPassword: string | null, password: string): boolean {
        if (!userPassword) {
            throw new Error("No password found in storage.");
        }

        try {
            
            const decryptedPassword = this.encryptionService.decrypt(userPassword);

            if (decryptedPassword === password) {
                return true; 
            } else {
                throw new Error("Incorrect password.");
            }
        } catch (error) {
            console.error("Error decrypting the password:", error);
            throw new Error("Error decrypting the password.");
        }
    }
}
