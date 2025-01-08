import { PumpTokenModel } from "@/models/pump-token.model"
import Xtronx from "data-base64:/assets/app-logo/xtronx.jpg"
import Bandan from "data-base64:/assets/app-logo/bandan.png"
import TrumpLoves from "data-base64:/assets/app-logo/trumpLoves.jpg"
import Bob_Super_Pomeranian from "data-base64:/assets/app-logo/bobSuper.jpeg"
import DefaultLogo from "data-base64:/assets/tokens/default.png"

export const PumpTokenData: PumpTokenModel[] = [
  {
    id: 1,
      name: "TRON X",
      symbol: "$ XTRONX",
      creator: "TGdh...giuU",
      description: "Elevate your TRON X experience with the exclusive Maker King Token Coins. With King Token Coins such as TRON X , you're not just investing; you're crowning yourself in the realm of crypto kings. KTC, puts a light watermark to ensure authenticity.",
      contract: "TK6qbhdzrEqXFNd7Q...giuU",
      marketCap: "$9.62k",
      price: "0.000036 TRX",
      virtualLiquidity: "$19.6k",
      volume24h: "2,581.64 TRX",
      tokenCreated: "12H 41M",
      percentage: "(2%)",
      image_url: Xtronx,
      network: "Xode"
  },
  {
    id: 2,
      name: "Bandan",
      symbol: "$ Bandan",
      creator: "TGdh...giuU",
      description: "Bandan: Peeling his way to $120,000, one tape at a time!",
      contract: "TK6qbhdzrEqXFNd7Q...giuU",
      marketCap: "$9.62k",
      price: "0.000036 TRX",
      virtualLiquidity: "$19.6k",
      volume24h: "2,581.64 TRX",
      tokenCreated: "12H 41M",
      percentage: "(2%)",
      image_url: Bandan,
      network: "Xode"
  },
  {
    id: 3,
      name: "Trump Loves baNana",
      symbol: "$ TLN",
      creator: "TGdh...giuU",
      description: "As Justin Sun said: \"T for Trump, N for Banana,\" TLN therefore means Trump Loves baNana. TLN will be the first MEME token listed on Max-Pump.Fun, a brand-new pump-and-swap platform.",
      contract: "TK6qbhdzrEqXFNd7Q...giuU",
      marketCap: "$9.62k",
      price: "0.000036 TRX",
      virtualLiquidity: "$19.6k",
      volume24h: "2,581.64 TRX",
      tokenCreated: "12H 41M",
      percentage: "(2%)",
      image_url: TrumpLoves,
      network: "Xode"
  },
  {
    id: 4,
      name: "Bob Super Pomeranian",
      symbol: "$ BSP",
      creator: "TGdh...giuU",
      contract: "TK6qbhdzrEqXFNd7Q...giuU",
      description: "Bob super hero Pomeranian. His strength is his beauty and friendliness",
      marketCap: "$9.62k",
      price: "0.000036 TRX",
      virtualLiquidity: "$19.6k",
      volume24h: "2,581.64 TRX",
      tokenCreated: "12H 41M",
      percentage: "(2%)",
      image_url: Bob_Super_Pomeranian,
      network: "Xode"
  }
]

export class PumpTokenImages {
    getBase64Image(imageName: string) {
      switch (imageName) {
        case "Xtronx": return Xtronx
        case "Bandan": return Bandan
        case "TrumpLoves": return TrumpLoves
        case "Bob_Super_Pomeranian": return Bob_Super_Pomeranian
        default: return DefaultLogo
      }
    }
}