import { Storage } from "@plasmohq/storage"

export class CurrentPageService {
    private storage = new Storage({
        area: 'local',
        allCopied: true
    })
    private storageKey = "current_page"

    async getCurrentPage(): Promise<string | any> {
        return new Promise(async (resolve, reject) => {
            try {
                const storedData = await this.storage.get<string>(this.storageKey)
                if (!storedData) {
                    return resolve(null)
                }

                resolve(storedData)
            } catch (error) {
                reject(error)
            }
        })
    }

    async setCurrentPage(data: string): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.storage.set(this.storageKey, data)

                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
}
