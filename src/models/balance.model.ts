import type { TokenModel } from "./token.model"

export class SubstrateFeeModel {
  feeClass: string;
  weight: string;
  partialFee: string;
}

export class BalanceModel {
  owner: string
  token: TokenModel
  freeBalance: number
  reservedBalance: number
  is_frozen: boolean
}
