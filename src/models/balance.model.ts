import type { TokenModel } from "./token.model"
import type { WalletModel } from "./wallet.model"

export class BalanceModel {
  owner: WalletModel | null
  token: TokenModel
  freeBalance: number
  reservedBalance: number
  isFrozen: boolean
  status: string
}
