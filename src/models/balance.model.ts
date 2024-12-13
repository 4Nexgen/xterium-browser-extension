export class BalanceModel {
  symbol: string
  mnemonic_phrase?: string
  description: string
  image_url: string
  network: string
  network_id: number
  type: string
  owner: string
  balance: string
  reserveBalance: string
  is_frozen: boolean
}
