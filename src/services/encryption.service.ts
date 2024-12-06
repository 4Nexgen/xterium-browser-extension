import CryptoJS from "crypto-js"

export class EncryptionService {
    private key = 'secret-key'  

    encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.key).toString()
    }

    decrypt(data: string): string {
        const bytes = CryptoJS.AES.decrypt(data, this.key)
        return bytes.toString(CryptoJS.enc.Utf8)
    }
}
