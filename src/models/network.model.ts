import Polkadot from "data-base64:/assets/networks/polkadot.svg"
import Kusama from "data-base64:/assets/networks/kusama.svg"
import Xode from "data-base64:/assets/networks/xode.png"

export class NetworkModel {
    name: string
    rpc: string
    is_testnet: boolean
    logo: string
}

export class NetworkImages {
    getBase64Image(imageName: string) {
        switch (imageName) {
            case "Polkadot": return Polkadot
            case "Kusama": return Kusama
            case "Xode": return Xode
        }
    }
}