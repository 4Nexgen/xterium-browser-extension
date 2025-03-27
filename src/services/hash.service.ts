import CryptoJS from "crypto-js"

export class HashService {
  hash(data: string): string {
    const hashed = CryptoJS.SHA256(data).toString();
    return hashed;
  }
}