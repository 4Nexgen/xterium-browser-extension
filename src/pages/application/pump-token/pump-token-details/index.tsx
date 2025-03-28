import { ChainAssetFiles } from "@/data/chains/chain-asset-files"
import type { NetworkModel } from "@/models/network.model"
import type { TokenModel } from "@/models/token.model"
import type { ApiPromise } from "@polkadot/api"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexPumpTokenDetailsPops {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
  currentPumpToken: TokenModel | null
}

const IndexPumpTokenDetails = ({
  currentNetwork,
  currentWsAPI,
  currentPumpToken
}: IndexPumpTokenDetailsPops) => {
  const { t } = useTranslation()

  const [network, setNetwork] = useState<NetworkModel | null>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [pumpToken, setPumpToken] = useState<TokenModel | null>(null)

  const [pumpTokenLogoMap, setPumpTokenLogoMap] = useState<{ [key: string]: string }>({})
  const [pumpTokenCoverMap, setPumpTokenCoverMap] = useState<{ [key: string]: string }>(
    {}
  )

  useEffect(() => {
    if (currentNetwork) {
      setNetwork(currentNetwork)
    }
  }, [currentNetwork])

  useEffect(() => {
    if (currentWsAPI) {
      setWsAPI(currentWsAPI)
    }
  }, [currentWsAPI])

  useEffect(() => {
    if (currentPumpToken) {
      setPumpToken(currentPumpToken)
    }
  }, [currentPumpToken])

  useEffect(() => {
    if (pumpToken) {
      const getPumpTokenAssetFiles = async (token: TokenModel) => {
        const tokenAssetFiles = await ChainAssetFiles.load(network.name)

        const newLogoMap: { [key: string]: string } = {}
        const newCoverMap: { [key: string]: string } = {}

        newLogoMap["XON"] = tokenAssetFiles.getTokenLogo("XON")
        newLogoMap[token.symbol] = tokenAssetFiles.getTokenLogo(token.symbol)
        newCoverMap[token.symbol] = tokenAssetFiles.getTokenCover(token.symbol)

        setPumpTokenLogoMap(newLogoMap)
        setPumpTokenCoverMap(newCoverMap)
      }

      getPumpTokenAssetFiles(pumpToken)
    }
  }, [pumpToken])

  const formatCurrency = (amount: number) => {
    if (amount >= 1e24) {
      return `${(amount / 1e24).toFixed(4)} T`
    } else if (amount >= 1e21) {
      return `${(amount / 1e21).toFixed(4)} B`
    } else if (amount >= 1e18) {
      return `${(amount / 1e18).toFixed(4)} Q`
    } else if (amount >= 1e15) {
      return `${(amount / 1e15).toFixed(4)} P`
    } else if (amount >= 1e12) {
      return `${(amount / 1e12).toFixed(4)} T`
    } else if (amount >= 1e9) {
      return `${(amount / 1e9).toFixed(4)} B`
    } else if (amount >= 1e6) {
      return `${(amount / 1e6).toFixed(4)} M`
    } else if (amount >= 1e3) {
      return `${(amount / 1e3).toFixed(4)} k`
    }
    return `${amount.toFixed(4)}`
  }

  const formatMinBalance = (amount: number) => {
    const formattedValue = (amount / 1e12).toFixed(4)
    return formattedValue
  }

  return (
    <>
      {pumpToken && (
        <div className="p-4">
          <div className="w-full flex justify-center mb-4">
            <Image
              src={
                pumpTokenCoverMap[pumpToken.symbol] || "/assets/tokens/covers/default.png"
              }
              alt={pumpToken.name || "Token Image"}
              width={40}
              height={40}
              className="h-24 w-full object-cover object-center rounded-lg"
            />
          </div>
          <div className="flex">
            <div>
              <Image
                src={pumpTokenLogoMap[pumpToken.symbol] || "/assets/tokens/default.png"}
                alt={pumpToken.name}
                width={40}
                height={40}
                className="rounded-full object-cover h-20 w-20"
              />
            </div>
            <div className="ml-6 w-3/4">
              <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                  <p>
                    Created by:{" "}
                    <span className="font-semibold">
                      {pumpToken.owner
                        ? `${pumpToken.owner.slice(0, 4)}...${pumpToken.owner.slice(-4)}`
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-x-2">
                <p className="font-semibold">{t("Contract: ")}</p>
                <p className="opacity-70 text-muted">{pumpToken.token_id ?? "N/A"}</p>
              </div>
              <div className="mt-2">
                <p className="opacity-70">{pumpToken.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
              <div className="flex items-center">
                <p className="font-semibold text-sm opacity-70 mr-2">{t("Price")}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">
                  {pumpToken.price}
                  <Image
                    src={pumpTokenLogoMap["XON"] || "/assets/tokens/default.png"}
                    alt="Xode Logo"
                    width={40}
                    height={40}
                    className="h-4 w-4 inline ml-1 mr-1 mb-0.5"
                  />
                  XON
                </p>
              </div>
            </div>
            <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
              <p className="opacity-70 text-sm">{t("Min Balance")}</p>
              <p className="font-bold text-sm">
                {formatMinBalance(pumpToken.minBalance)} {pumpToken.symbol ?? "N/A"}
              </p>
            </div>
            <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
              <p className="opacity-70 text-sm">{t("Total Supply")}</p>
              <p className="font-bold text-sm">
                {formatCurrency(pumpToken.supply)}
                {pumpToken.symbol ?? "N/A"}
              </p>
            </div>
            <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
              <p className="opacity-70 text-sm">{t("Token Created")}</p>
              <p className="font-bold text-sm">{pumpToken.created_at}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default IndexPumpTokenDetails
