import { ChainAssetFiles } from "../chain-asset-files";

import DefaultLogo from "data-base64:/assets/tokens/default.png";

import PASLogo from "data-base64:/assets/tokens/paseo-asset-hub/pas.png";

export class TokenAssetFiles extends ChainAssetFiles {
  getTokenLogo(imageName: string): string {
    switch (imageName) {
      case "PAS": return PASLogo;
      default: return DefaultLogo;
    }
  }

  getTokenCover(imageName: string): string {
    switch (imageName) {
      default: return DefaultLogo;
    }
  }
}