import type { AssetDetails } from "@polkadot/types/interfaces"

export class PumpTokenModel {
  id: number;
  description: string;
  marketCap: number;
  price: number;
  tokenCreated: Date;
  image_url: string; 
  image_url_cover: string;
  network: string;
  network_id: number;
  decimals: number;
  symbol: string;
  type: string; 


  
}

export interface PumpTokenWithAssetDetails extends PumpTokenModel {
  assetDetail?: {
    assetId: number;
    name: string;
    symbol: string;
    owner: string;
    marketCap: number;
    minBalance: number;
    supply: number;
    
  };
}