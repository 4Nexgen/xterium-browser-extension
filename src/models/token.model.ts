export class TokenModel {
  id: number
  type: string
  network: string
  token_id: number
  symbol: string
  name: string
  description: string
  decimals: number
  price: number;
  owner: string
  issuer: string
  admin: string
  freezer: string
  supply: number
  deposit: number
  minBalance: number
  isSufficient: boolean
  accounts: number
  sufficients: number
  approvals: number
  status: string
  created_at: string
}