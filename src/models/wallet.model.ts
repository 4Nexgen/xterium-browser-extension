import { BalanceModel } from "./balance.model";
export class WalletModel {
  id: number
  name: string
  address_type: string
  mnemonic_phrase: string
  secret_key: string
  metaGenesisHash?: string;
  metaName: string;
  metaSource?: string;
  tokenSymbol?: string;
  public_key: string  
  balances: BalanceModel[];
  type: string;
}

