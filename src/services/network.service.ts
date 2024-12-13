import { NetworkModel } from "@/models/network.model"
import { Storage } from "@plasmohq/storage"

export class NetworkService {
    private storage = new Storage({
        area: 'local',
        allCopied: true
    })
    private storageKey = "networks"

    async getNetwork(): Promise<NetworkModel> {
        return new Promise(async (resolve, reject) => {
            try {
                const storedData = await this.storage.get<string>(this.storageKey)

                if (!storedData) {
                    return resolve(null)
                }

                const network: NetworkModel = JSON.parse(storedData)
                resolve(network)
            } catch (error) {
                reject(error)
            }
        })
    }

    async setNetwork(data: NetworkModel): Promise<boolean | any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.storage.set(this.storageKey, JSON.stringify(data))

                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
}
