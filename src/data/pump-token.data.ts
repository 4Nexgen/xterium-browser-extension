import { PumpTokenModel } from "@/models/pump-token.model"
import Xtronx from "data-base64:/assets/app-logo/xtronx.png"
import Bandan from "data-base64:/assets/app-logo/bandan.png"
import BananaMan from "data-base64:/assets/app-logo/bananaMan.png"
import PupperHero from "data-base64:/assets/app-logo/pupperHero.png"
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
  },
  {
    id: 2,
      name: "Bandan",
      symbol: "$ Bandan",
      creator: "TGdh...giuU",
      description: "Bandan tokens are here to revolutionize the game with unique offerings and possibilities. Whether you're an investor or enthusiast, Bandan empowers you to explore the crypto space with confidence and creativity. Join the Bandan revolution today.",
      contract: "TK6qbhdzrEqXFNd7Q...giuU",
      marketCap: "$9.62k",
      price: "0.000036 TRX",
      virtualLiquidity: "$19.6k",
      volume24h: "2,581.64 TRX",
      tokenCreated: "12H 41M",
      percentage: "(2%)",
      image_url: Bandan,
  },
  {
    id: 3,
      name: "Banana Man",
      symbol: "$ Banana",
      creator: "TGdh...giuU",
      description: "Banana Man tokens are as fun as they are valuable, paving the way for new adventures in the crypto world. With every token, you're unlocking opportunities for entertainment and financial growth. Dive into the Banana Man ecosystem and reap the rewards!",
      contract: "TK6qbhdzrEqXFNd7Q...giuU",
      marketCap: "$9.62k",
      price: "0.000036 TRX",
      virtualLiquidity: "$19.6k",
      volume24h: "2,581.64 TRX",
      tokenCreated: "12H 41M",
      percentage: "(2%)",
      image_url: BananaMan,
  },
  {
    id: 4,
      name: "Pupper Hero",
      symbol: "$ PUPP",
      creator: "TGdh...giuU",
      contract: "TK6qbhdzrEqXFNd7Q...giuU",
      description: "Pupper Hero tokens are here to save the day with loyalty and strength in the crypto market. Join the Pupper Hero community to experience a token that combines stability, trust, and heroic potential. Be part of the journey and make a difference!",
      marketCap: "$9.62k",
      price: "0.000036 TRX",
      virtualLiquidity: "$19.6k",
      volume24h: "2,581.64 TRX",
      tokenCreated: "12H 41M",
      percentage: "(2%)",
      image_url: PupperHero,
  }
]

export class PumpTokenImages {
    getBase64Image(imageName: string) {
      switch (imageName) {
        case "Xtronx": return Xtronx
        case "Bandan": return Bandan
        case "BananaMan": return BananaMan
        case "PupperHero": return PupperHero
        default: return DefaultLogo
      }
    }
}