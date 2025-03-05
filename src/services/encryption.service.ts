import CryptoJS from "crypto-js"

export class EncryptionService {
  encrypt(key: string, data: string): string {
    return CryptoJS.AES.encrypt(data, key).toString()
  }

  decrypt(key: string, data: string): string {
    const bytes = CryptoJS.AES.decrypt(data, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
}
