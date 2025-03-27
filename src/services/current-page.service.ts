import { Storage } from "@plasmohq/storage"

export class CurrentPageService {
  private storage = new Storage({
    area: "local",
    allCopied: true
  })
  private storageKey = "current_page"

  async getCurrentPage(): Promise<string | null> {
    const storedData = await this.storage.get<string>(this.storageKey)
    if (!storedData) {
      return null
    }

    return storedData
  }

  async setCurrentPage(data: string): Promise<boolean> {
    await this.storage.set(this.storageKey, data)
    return true
  }
}
