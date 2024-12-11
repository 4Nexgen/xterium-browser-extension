import { EncryptionService } from './encryption.service';
import { Storage } from "@plasmohq/storage";

export class LoginService {
    private storage = new Storage({
        area: 'local',
        allCopied: true
    })
    private storageKey = "user"
    private encryptionService = new EncryptionService()

    async login(password: string): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                const userPassword = await this.storage.getItem(this.storageKey);
                if (!userPassword) {
                    reject("No password found in storage.")
                }

                let isMatched = false
                const decryptedPassword = this.encryptionService.decrypt(password, userPassword);
                if (decryptedPassword === password) {
                    isMatched = true;
                }

                resolve(isMatched)
            } catch (error) {
                reject(error)
            }
        })
    }
}
