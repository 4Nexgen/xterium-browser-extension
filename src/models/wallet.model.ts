import { BalanceModel } from "./balance.model";
export class WalletModel {
  id: number
  name: string
  address_type: string
  mnemonic_phrase: string
  secret_key: string
  public_key: string  
  balances: BalanceModel; 
}

