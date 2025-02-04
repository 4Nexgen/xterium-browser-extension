import { TokenModel } from "@/models/token.model"
import AZKLogo from "data-base64:/assets/tokens/azkal.png"
import IXAVLogo from "data-base64:/assets/tokens/ixav.png"
import IXONLogo from "data-base64:/assets/tokens/ixon.png"
import XAVLogo from "data-base64:/assets/tokens/xav.png"
import XGMLogo from "data-base64:/assets/tokens/xgm.png"
import XONLogo from "data-base64:/assets/tokens/xon.png"
import IDONLogo from "data-base64:/assets/tokens/idon.png"
import MPCLogo from "data-base64:/assets/tokens/mpc.png"
import IMPCLogo from "data-base64:/assets/tokens/impc.png"
import DONLogo from "data-base64:/assets/tokens/don.png"

import DefaultLogo from "data-base64:/assets/tokens/default.png"

export const TokenData: TokenModel[] = [
  {
    id: 1,
    image_url: "XONLogo",
    type: "Native",
    network: "Xode",
    network_id: 0,
    symbol: "XON",
    description: "Native XON Token"
  },
  {
    id: 2,
    image_url: "XGMLogo",
    type: "Asset",
    network: "Xode",
    network_id: 1
  },
  {
    id: 3,
    image_url: "XAVLogo",
    type: "Asset",
    network: "Xode",
    network_id: 2
  },
  {
    id: 4,
    image_url: "AZKLogo",
    type: "Asset",
    network: "Xode",
    network_id: 3
  },
  {
    id: 5,
    image_url: "IXONLogo",
    type: "Asset",
    network: "Xode",
    network_id: 4
  },
  {
    id: 6,
    image_url: "IXAVLogo",
    type: "Asset",
    network: "Xode",
    network_id: 5
  },
  {
    id: 7,
    image_url: "IDONLogo",
    type: "Asset",
    network: "Xode",
    network_id: 6
  },
  {
    id: 8,
    image_url: "MPCLogo",
    type: "Asset",
    network: "Xode",
    network_id: 7
  },
  {
    id: 9,
    image_url: "IMPCLogo",
    type: "Asset",
    network: "Xode",
    network_id: 8
  },
  {
    id: 10,
    image_url: "DONLogo",
    type: "Asset",
    network: "Xode",
    network_id: 9
  }
]

export class TokenImages {
  getBase64Image(imageName: string) {
    switch (imageName) {
      case "XONLogo": return XONLogo
      case "XGMLogo": return XGMLogo
      case "XAVLogo": return XAVLogo
      case "AZKLogo": return AZKLogo
      case "IXONLogo": return IXONLogo
      case "IXAVLogo": return IXAVLogo
      case "IDONLogo": return IDONLogo
      case "MPCLogo": return MPCLogo
      case "IMPCLogo": return IMPCLogo
      case "DONLogo": return DONLogo
      default: return DefaultLogo
    }
  }
}