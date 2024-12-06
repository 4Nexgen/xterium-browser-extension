import type { Balance } from "@/models/balance.model"
import AZKLogo from "data-base64:/assets/tokens/azk.png"
import IXAVLogo from "data-base64:/assets/tokens/ixav.png"
import IXONLogo from "data-base64:/assets/tokens/ixon.png"
import XAVLogo from "data-base64:/assets/tokens/xav.png"
import XGMLogo from "data-base64:/assets/tokens/xgm.png"
import XONLogo from "data-base64:/assets/tokens/xon.png"

export const balance_data: Balance[] = [
  {
    symbol: "XON",
    description: "Native XON Token",
    image_url: XONLogo,
    network: "Xode",
    owner: "5Clkajsdlashlili3y123211294798910h237",
    balance: "1,000.00",
    reserveBalance: "0",
  },
  {
    symbol: "XGM",
    description: "XGame Utility Token",
    image_url: XGMLogo,
    network: "Xode",
    owner: "5Clkajsdlashlili3y123211294798910h237",
    balance: "1,000.00",
    reserveBalance: "0",
  },
  {
    symbol: "XAV",
    description: "Xaver Utility Token",
    image_url: XAVLogo,
    network: "Xode",
    owner: "5Clkajsdlashlili3y123211294798910h237",
    balance: "1,000.00",
    reserveBalance: "0",
  },
  {
    symbol: "AZK",
    description: "Azkal Meme Token",
    image_url: AZKLogo,
    network: "Xode",
    owner: "5Clkajsdlashlili3y123211294798910h237",
    balance: "1,000.00",
    reserveBalance: "0",
  },
  {
    symbol: "IXON",
    description: "Private XON Token",
    image_url: IXONLogo,
    network: "Xode",
    owner: "5Clkajsdlashlili3y123211294798910h237",
    balance: "1,000.00",
    reserveBalance: "0",
  },
  {
    symbol: "IXAV",
    description: "Private XAV Token",
    image_url: IXAVLogo,
    network: "Xode",
    owner: "5Clkajsdlashlili3y123211294798910h237",
    balance: "1,000.00",
    reserveBalance: "0",
  }
]
