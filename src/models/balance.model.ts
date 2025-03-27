import type { WalletModel } from "./wallet.model"
import type { TokenModel } from "./token.model"

export class BalanceModel {
  owner: WalletModel | null
  token: TokenModel
  freeBalance: number
  reservedBalance: number
  is_frozen: boolean
}
