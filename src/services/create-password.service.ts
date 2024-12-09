import { EncryptionService } from './encryption.service';
import { Storage } from '@plasmohq/storage';

export class CreatePasswordService {
    private key = "userPassword"; 
    private encryptionService: EncryptionService;
    private storage: Storage;  

    constructor() {
        this.storage = new Storage({
            area: 'local',  
            allCopied: true  
        });
        this.encryptionService = new EncryptionService();
    }


    async createPassword(password: string): Promise<void> {
        const encryptedPassword = this.encryptionService.encrypt(password);
        await this.storage.setItem(this.key, encryptedPassword); 
    }

    async getPassword(): Promise<string | null> {
        const storedData = await this.storage.getItem(this.key); 
        if (storedData) {
            try {
                return this.encryptionService.decrypt(storedData);  
            } catch (error) {
                console.error("Error decrypting password:", error);
                return null;
            }
        }
        return null;  
    }


    async updatePassword(password: string): Promise<void> {
        const existingPassword = await this.getPassword();  
        if (!existingPassword) {
            throw new Error("No password data found to update.");
        }

        const encryptedPassword = this.encryptionService.encrypt(password);
        await this.storage.setItem(this.key, encryptedPassword);  
    }

    async removePassword(): Promise<void> {
        await this.storage.removeItem(this.key);  
    }
}
