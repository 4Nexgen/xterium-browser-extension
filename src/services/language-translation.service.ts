import { Storage } from "@plasmohq/storage"

import i18n from "../i18n"

export class LanguageTranslationService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })

  private key = "language"

  async changeLanguage(lng: string): Promise<void> {
    i18n.changeLanguage(lng)
    await this.setStoredLanguage(lng)
  }

  getLanguageName(lng: string): string {
    const languageMap: Record<string, string> = {
      en: "English",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese"
    }
    return languageMap[lng] || "English"
  }

  async getStoredLanguage(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.storage
        .get<string>(this.key)
        .then((language) => {
          if (language) {
            resolve(language)
          } else {
            resolve(null)
          }
        })
        .catch((error) => reject(`Error retrieving language: ${error}`))
    })
  }

  async setStoredLanguage(lng: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage
        .set(this.key, lng)
        .then(() => resolve())
        .catch((error) => reject(`Error storing language: ${error}`))
    })
  }
}
