import { TokenModel } from "@/models/token.model"
import { ApiPromise } from "@polkadot/api"

import type { NetworkModel } from "@/models/network.model"

import pumpTokens from "../data/chains/xode/pump-tokens.json"

export class TokenService {
  pumpTokens(): TokenModel[] {
    return pumpTokens as unknown as TokenModel[]
  }

  async getTokens(network: NetworkModel, wsAPI: ApiPromise): Promise<TokenModel[]> {
    const pumpTokens = this.pumpTokens()
    const tokens: TokenModel[] = []

    const rpcSystem = wsAPI.rpc.system

    const nativeTokenSymbol = (await rpcSystem.properties()).toHuman()["tokenSymbol"][0]
    const nativeTokenName = (await rpcSystem.chain()).toHuman()
    const nativeTokenDecimals = (await rpcSystem.properties()).toHuman()[
      "tokenDecimals"
    ][0]

    tokens.push({
      id: 0,
      type: "Native",
      network: network.name,
      token_id: 0,
      symbol: nativeTokenSymbol,
      name: nativeTokenName,
      description: nativeTokenName,
      decimals: nativeTokenDecimals,
      price: 0,
      owner: "",
      issuer: "",
      admin: "",
      freezer: "",
      supply: 0,
      deposit: 0,
      minBalance: 0,
      isSufficient: false,
      accounts: 0,
      sufficients: 0,
      approvals: 0,
      status: "",
      created_at: ""
    })

    const assetMetadatas: {
      id: number
      name: string
      symbol: string
      deposit: number
      decimals: number
      isFrozen: string
    }[] = []

    const queryAssets = wsAPI.query.assets

    if (queryAssets) {
      const assetMetadataEntries = await queryAssets.metadata.entries()
      if (assetMetadataEntries.length > 0) {
        assetMetadataEntries.map((metadata) => {
          const assetId = parseInt(metadata[0].toHuman().toString().replace(/,/g, ''))
          const assetData = metadata[1].toHuman()

          assetMetadatas.push({
            id: assetId,
            name: assetData["name"],
            symbol: assetData["symbol"],
            deposit: parseInt(assetData["deposit"]),
            decimals: parseInt(assetData["decimals"]),
            isFrozen: assetData["isFrozen"]
          })
        })
      }

      if (assetMetadatas.length > 0) {
        const assetEntries = await queryAssets.asset.entries()
        if (assetEntries.length > 0) {
          assetEntries.map((asset) => {
            const assetId = parseInt(asset[0].toHuman().toString().replace(/,/g, ''))
            const metadata = assetMetadatas.filter((d) => d.id === assetId)[0]

            let pumpToken: TokenModel = null;
            if (pumpTokens.length > 0) {
              pumpToken = pumpTokens.filter(d => d.network === network.name && d.token_id === assetId)[0]
            }

            if (metadata !== undefined) {

              // Special Case - Need more modification on this line
              if (network.name === "Polkadot - Asset Hub") {
                if (metadata.symbol !== "DOT" && metadata.symbol !== "MPC") {
                  return
                }
              }

              if (nativeTokenSymbol !== metadata.symbol) {
                const assetProps = asset[1].toHuman()
                tokens.push({
                  id: assetId,
                  type: pumpToken ? pumpToken.type : "Asset",
                  network: network.name,
                  token_id: assetId,
                  symbol: metadata.symbol,
                  name: metadata.name,
                  description: pumpToken ? pumpToken.description : metadata.name,
                  decimals: metadata.decimals,
                  price: 0,
                  owner: assetProps["owner"],
                  issuer: assetProps["issuer"],
                  admin: assetProps["admin"],
                  freezer: assetProps["freezer"],
                  supply: parseInt(assetProps["supply"]),
                  deposit: parseInt(assetProps["deposit"]),
                  minBalance: parseInt(assetProps["minBalance"]),
                  isSufficient: assetProps["isSufficient"],
                  accounts: parseInt(assetProps["accounts"]),
                  sufficients: parseInt(assetProps["sufficients"]),
                  approvals: parseInt(assetProps["approvals"]),
                  status: assetProps["status"],
                  created_at: pumpToken ? pumpToken.created_at : ""
                })
              }

            }
          })
        }
      }
    }

    return tokens
  }

  async getToken(network: NetworkModel, wsAPI: ApiPromise, token_id: number): Promise<TokenModel | null> {
    const pumpTokens = this.pumpTokens()

    if (token_id === 0) {
      const rpcSystem = wsAPI.rpc.system

      const nativeTokenSymbol = (await rpcSystem.properties()).toHuman()["tokenSymbol"][0]
      const nativeTokenName = (await rpcSystem.chain()).toHuman()
      const nativeTokenDecimals = (await rpcSystem.properties()).toHuman()[
        "tokenDecimals"
      ][0]

      const token: TokenModel = {
        id: 0,
        type: "Native",
        network: network.name,
        token_id: 0,
        symbol: nativeTokenSymbol,
        name: nativeTokenName,
        description: nativeTokenName,
        decimals: nativeTokenDecimals,
        price: 0,
        owner: "",
        issuer: "",
        admin: "",
        freezer: "",
        supply: 0,
        deposit: 0,
        minBalance: 0,
        isSufficient: false,
        accounts: 0,
        sufficients: 0,
        approvals: 0,
        status: "",
        created_at: ""
      }

      return token
    } else {
      const queryAssets = wsAPI.query.assets

      if (queryAssets) {
        const assetMetadata = await queryAssets.metadata(token_id)

        if (assetMetadata) {
          const assetData = assetMetadata.toHuman()
          const metadata = {
            id: token_id,
            name: assetData["name"],
            symbol: assetData["symbol"],
            deposit: parseInt(assetData["deposit"]),
            decimals: parseInt(assetData["decimals"]),
            isFrozen: assetData["isFrozen"]
          }

          const asset = await queryAssets.asset(token_id)
          if (asset) {
            if (metadata !== undefined) {
              let pumpToken: TokenModel = null;
              if (pumpTokens.length > 0) {
                pumpToken = pumpTokens.filter(d => d.network === network.name && d.token_id === token_id)[0]
              }

              const assetProps = asset.toHuman()
              const token: TokenModel = {
                id: token_id,
                type: pumpToken ? pumpToken.type : "Asset",
                network: network.name,
                token_id: token_id,
                symbol: metadata.symbol,
                name: metadata.name,
                description: pumpToken ? pumpToken.description : metadata.name,
                decimals: metadata.decimals,
                price: 0,
                owner: assetProps["owner"],
                issuer: assetProps["issuer"],
                admin: assetProps["admin"],
                freezer: assetProps["freezer"],
                supply: parseInt(assetProps["supply"]),
                deposit: parseInt(assetProps["deposit"]),
                minBalance: parseInt(assetProps["minBalance"]),
                isSufficient: assetProps["isSufficient"],
                accounts: parseInt(assetProps["accounts"]),
                sufficients: parseInt(assetProps["sufficients"]),
                approvals: parseInt(assetProps["approvals"]),
                status: assetProps["status"],
                created_at: pumpToken ? pumpToken.created_at : ""
              }

              return token
            }
          }
        }
      }
    }

    return null
  }

  async createToken(network: NetworkModel, wsAPI: ApiPromise, data: TokenModel): Promise<string> {
    return "Token created successfully"
  }

  async updateToken(network: NetworkModel, wsAPI: ApiPromise, token_id: number, data: TokenModel): Promise<string> {
    return "Token updated successfully"
  }

  async deleteToken(network: NetworkModel, wsAPI: ApiPromise, token_id: number): Promise<boolean> {
    return true
  }
}