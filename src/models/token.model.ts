export class Token {
  id: number
  type: "Native" | "Asset"
  network: string
  network_id: number
  symbol: string
  description: string
  image_url: string
}
