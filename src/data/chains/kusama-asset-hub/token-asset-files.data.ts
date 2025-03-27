import { ChainAssetFiles } from "../chain-asset-files";

import DefaultLogo from "data-base64:/assets/tokens/default.png";

import KSMLogo from "data-base64:/assets/tokens/kusama-asset-hub/ksm.png";

export class TokenAssetFiles extends ChainAssetFiles {
  getTokenLogo(imageName: string): string {
    switch (imageName) {
      case "KSM": return KSMLogo;
      default: return DefaultLogo;
    }
  }

  getTokenCover(imageName: string): string {
    switch (imageName) {
      default: return DefaultLogo;
    }
  }
}