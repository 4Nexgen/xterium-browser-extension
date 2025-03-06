import type { VAModel } from "@/models/imurai.model"

export const defaultVirtualAssistantID: string = "679c777e947013d228ddda78"
export const imuraiWSURL: string = "wss://sme-api.imur.ai/api/llm/connect-socket/"
export const imuraiAPIURL: string = "https://sme-api.imur.ai/api/virtual-assistants/"

export class ImuraiService {
  async getVirtualAssistant(): Promise<VAModel | string> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(imuraiAPIURL + defaultVirtualAssistantID, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })

        if (!res.ok) {
          reject("Failed to fetch virtual assistant details")
        }

        const data = await res.json()

        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
}
