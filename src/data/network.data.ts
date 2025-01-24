import type { NetworkModel } from "@/models/network.model";

export const NetworkData: NetworkModel[] = [
    {
        name: "Xode",
        rpc: "wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc",
        is_testnet: false,
        logo: "Xode"
    },
    {
        name: "Polkadot",
        rpc: "",
        is_testnet: false,
        logo: "Polkadot"
    },
    {
        name: "Kusama",
        rpc: "",
        is_testnet: false,
        logo: "Kusama"
    }
]