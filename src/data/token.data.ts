import { Token } from "@/models/token.model";
import AZKLogo from "data-base64:/assets/tokens/azk.png";
import IXAVLogo from "data-base64:/assets/tokens/ixav.png";
import IXONLogo from "data-base64:/assets/tokens/ixon.png";
import XAVLogo from "data-base64:/assets/tokens/xav.png";
import XGMLogo from "data-base64:/assets/tokens/xgm.png";
import XONLogo from "data-base64:/assets/tokens/xon.png";

export const token_data: Token[] = [
  {
    image_url: XONLogo,
    type: "Native",
    network: "Xode",
    network_id: 0,
    symbol: "XON",
    description: "Native XON Token",
  },
  {
    image_url: XGMLogo,
    type: "Asset",
    network: "Xode",
    network_id: 1,
    symbol: "XGM",
    description: "XGame Utility Token",
  },
  {
    image_url: XAVLogo,
    type: "Asset",
    network: "Xode",
    network_id: 2,
    symbol: "XAV",
    description: "Xaver Utility Token",
  },
  {
    image_url: AZKLogo,
    type: "Asset",
    network: "Xode",
    network_id: 3,
    symbol: "AZK",
    description: "Azkal Meme Token",
  },
  {
    image_url: IXONLogo,
    type: "Asset",
    network: "Xode",
    network_id: 4,
    symbol: "IXON",
    description: "Private XON Token",
  },
  {

    image_url: IXAVLogo,
    type: "Asset",
    network: "Xode",
    network_id: 5,
    symbol: "IXAV",
    description: "Private XAV Token",
  },
];
