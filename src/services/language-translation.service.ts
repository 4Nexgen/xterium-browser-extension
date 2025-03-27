import { Storage } from "@plasmohq/storage"
import i18n from "../i18n"

export class LanguageTranslationService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private storageKey = "language"

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
    const storedData = await this.storage.get<string>(this.storageKey)
    if (!storedData) {
      return null
    }

    return storedData
  }

  async setStoredLanguage(lng: string): Promise<boolean> {
    await this.storage.set(this.storageKey, lng)
    return true
  }
}
