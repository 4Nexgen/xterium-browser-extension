import DefaultLogo from "data-base64:/assets/tokens/default.png"

import { ChainAssetFiles } from "../chain-asset-files"

export class TokenAssetFiles extends ChainAssetFiles {
  getTokenLogo(imageName: string): string {
    switch (imageName) {
      case "XTM":
        return DefaultLogo
    }
  }

  getTokenCover(imageName: string): string {
    switch (imageName) {
      default:
        return DefaultLogo
    }
  }
}
