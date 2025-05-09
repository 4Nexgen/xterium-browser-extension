import DefaultLogo from "data-base64:/assets/tokens/default.png"

import Polkadot from "data-base64:/assets/networks/polkadot.png"
import Kusama from "data-base64:/assets/networks/kusama.png"
import Xode from "data-base64:/assets/networks/xode.png"
import Paseo from "data-base64:/assets/networks/pas.png"

export class NetworkLogos {
    getLogo(imageName: string) {
        switch (imageName) {
            case "Asset Hub - Polkadot": return Polkadot
            case "Asset Hub - Kusama": return Kusama
            case "Xode - Polkadot": return Xode
            case "Xode - Kusama": return Xode
            case "Asset Hub - Paseo": return Paseo
            default: return DefaultLogo
        }
    }
}