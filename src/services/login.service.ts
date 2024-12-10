import { EncryptionService } from './encryption.service';
import { Storage } from "@plasmohq/storage";

export class LoginService {
    private storage: Storage;
    private encryptionService: EncryptionService;

    constructor() {
        this.storage = new Storage({
            area: "local",
            allCopied: true
        });
        this.encryptionService = new EncryptionService();
    }

    async login(password: string): Promise<boolean> {
        const userPassword = await this.storage.getItem("userPassword");

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
            throw new Error("Incorrect password.");
        }
    }
}
