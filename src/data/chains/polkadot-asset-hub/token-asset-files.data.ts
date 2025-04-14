import { ChainAssetFiles } from "../chain-asset-files";

import DefaultLogo from "data-base64:/assets/tokens/default.png";

import DOTLogo from "data-base64:/assets/tokens/polkadot-asset-hub/dot.png";
import MPCLogo from "data-base64:/assets/tokens/polkadot-asset-hub/mpc.png";
import DONLogo from "data-base64:/assets/tokens/polkadot-asset-hub/don.png";

export class TokenAssetFiles extends ChainAssetFiles {
  getTokenLogo(imageName: string): string {
    switch (imageName) {
      case "DOT": return DOTLogo;
      case "MPC": return MPCLogo;
      case "DON": return DONLogo;
      default: return DefaultLogo;
    }
  }

  getTokenCover(imageName: string): string {
    switch (imageName) {
      default: return DefaultLogo;
    }
  }
}