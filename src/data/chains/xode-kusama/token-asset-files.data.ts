import { ChainAssetFiles } from "../chain-asset-files";

import DefaultLogo from "data-base64:/assets/tokens/default.png";

import AZKLogo from "data-base64:/assets/tokens/xode-kusama/azk.png";
import IXAVLogo from "data-base64:/assets/tokens/xode-kusama/ixav.png";
import IXONLogo from "data-base64:/assets/tokens/xode-kusama/ixon.png";
import XAVLogo from "data-base64:/assets/tokens/xode-kusama/xav.png";
import XGMLogo from "data-base64:/assets/tokens/xode-kusama/xgm.png";
import XONLogo from "data-base64:/assets/tokens/xode-kusama/xon.png";
import IDONLogo from "data-base64:/assets/tokens/xode-kusama/idon.png";
import MPCLogo from "data-base64:/assets/tokens/xode-kusama/mpc.png";
import IMPCLogo from "data-base64:/assets/tokens/xode-kusama/impc.png";
import DONLogo from "data-base64:/assets/tokens/xode-kusama/don.png";

import MPCCover from "data-base64:/assets/tokens/xode-kusama/covers/mpc-cover.png";
import AZKCover from "data-base64:/assets/tokens/xode-kusama/covers/azk-cover.png";

export class TokenAssetFiles extends ChainAssetFiles {
  getTokenLogo(imageName: string): string {
    switch (imageName) {
      case "XON": return XONLogo;
      case "XGM": return XGMLogo;
      case "XAV": return XAVLogo;
      case "AZK": return AZKLogo;
      case "IXON": return IXONLogo;
      case "IXAV": return IXAVLogo;
      case "IDON": return IDONLogo;
      case "MPC": return MPCLogo;
      case "IMPC": return IMPCLogo;
      case "DON": return DONLogo;
      default: return DefaultLogo;
    }
  }

  getTokenCover(imageName: string): string {
    switch (imageName) {
      case "MPC": return MPCCover;
      case "AZK": return AZKCover;
      default: return DefaultLogo;
    }
  }
}