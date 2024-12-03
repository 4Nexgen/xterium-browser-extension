import { Token } from "@/models/token.model"
import AZKLogo from "data-base64:/assets/tokens/azk.png"
import IXAVLogo from "data-base64:/assets/tokens/ixav.png"
import IXONLogo from "data-base64:/assets/tokens/ixon.png"
import XAVLogo from "data-base64:/assets/tokens/xav.png"
import XGMLogo from "data-base64:/assets/tokens/xgm.png"
import XONLogo from "data-base64:/assets/tokens/xon.png"

export const token_data: Token[] = [
  {
    symbol: "XON",
    name: "Native XON Token",
    balance: "1,000.00",
    logo: XONLogo
  },
  {
    symbol: "XGM",
    name: "XGame Utility Token",
    balance: "100.00",
    logo: XGMLogo
  },
  {
    symbol: "XAV",
    name: "Xaver Utility Token",
    balance: "500.00",
    logo: XAVLogo
  },
  {
    symbol: "AZK",
    name: "Azkal Meme Token",
    balance: "1,000.00",
    logo: AZKLogo
  },
  {
    symbol: "IXON",
    name: "Private XON Token",
    balance: "4,021.00",
    logo: IXONLogo
  },
  {
    symbol: "IXAV",
    name: "Private XAV Token",
    balance: "4,021.00",
    logo: IXAVLogo
  }
]
