import DefaultLogo from "data-base64:/assets/tokens/default.png"

import Polkadot from "data-base64:/assets/networks/polkadot.png"
import Kusama from "data-base64:/assets/networks/kusama.png"
import Xode from "data-base64:/assets/networks/xode.png"
import Paseo from "data-base64:/assets/networks/pas.png"

export class NetworkLogos {
    getLogo(imageName: string) {
        switch (imageName) {
            case "Polkadot - Asset Hub": return Polkadot
            case "Kusama - Asset Hub": return Kusama
            case "Xode": return Xode
            case "Paseo - Asset Hub": return Paseo
            default: return DefaultLogo
        }
    }
}