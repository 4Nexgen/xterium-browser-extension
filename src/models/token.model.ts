export class TokenModel {
  id: number
  type: string
  network: string
  network_id: number
  symbol?: string
  description?: string
  image_url: string
  preloaded?: boolean
  assetId?: number
  decimals: number
  marketCap?: number; 
  price?: number; 

}
