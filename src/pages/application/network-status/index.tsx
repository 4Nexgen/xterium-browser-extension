import Loader from "@/components/loader"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { NetworkModel } from "@/models/network.model"
import { XodeService } from "@/services/xode.service"
import type { ApiPromise } from "@polkadot/api"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import { Blocks, HandCoins, Hourglass, LoaderCircle, Wallet } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexNetworkStatusProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
}

const IndexNetworkStatus = ({
  currentNetwork,
  currentWsAPI
}: IndexNetworkStatusProps) => {
  const { t } = useTranslation()

  const xodeService = useMemo(() => new XodeService(), [])

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [networkStatus, setNetworkStatus] = useState({
    totalBlocks: 0,
    totalAddresses: 0,
    avgBlockInterval: 12,
    lastGasFee: 0
  })

  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true)

    if (currentNetwork) {
      setNetwork(currentNetwork)
    }
  }, [currentNetwork])

  useEffect(() => {
    if (currentWsAPI) {
      setWsAPI(currentWsAPI)
    }
  }, [currentWsAPI])

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toFixed(1)}T`
    }
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`
    } else {
      return num.toLocaleString()
    }
  }

  const getNetworkStatus = async () => {
    xodeService.getTotalBlocks(wsAPI, (totalBlocks) => {
      setNetworkStatus((prevStatus) => ({
        ...prevStatus,
        totalBlocks
      }))
    })

    xodeService.getTotalAddresses(wsAPI, (totalAddresses) => {
      setNetworkStatus((prevStatus) => ({
        ...prevStatus,
        totalAddresses
      }))
    })

    setLoading(false)
  }

  useEffect(() => {
    if (wsAPI !== null) {
      getNetworkStatus()
    }
  }, [wsAPI])

  return (
    <>
      {loading ? (
        <Loader label="Initializing network..." />
      ) : (
        <div className="py-4 flex flex-col justify-between h-full">
          <div className="py-4">
            <img src={XteriumLogo} className="w-[150px] mx-auto" alt="Xterium Logo" />
          </div>
          <ScrollArea className="p-4 flex-1">
            {loading ? (
              <div className="flex flex-col items-center w-full h-30 gap-4 mt-10">
                <LoaderCircle className="animate-spin h-12 w-12 text-muted" />
                <p className="text-muted ml-2 text-lg">
                  {loading ? t("Loading...") : t("Loading...")}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap w-[352px] mx-auto">
                <div className="flex items-center justify-center h-full w-1/2 p-2">
                  <div className="text-center py-10 w-full relative network-box h-full">
                    <Blocks className="absolute top-0 left-0 ml-1 mt-1" size="25" />
                    <p className="text-2xl font-extrabold mt-6 text-primary dark:text-[#FFADFB]">
                      {formatNumber(networkStatus.totalBlocks)}
                    </p>
                    <Label className="text-sm opacity-50">{t("Total Blocks")}</Label>
                  </div>
                </div>
                <div className="flex items-center justify-center h-full w-1/2 p-2">
                  <div className="text-center py-10 w-full relative network-box h-full">
                    <Wallet className="absolute top-0 left-0 ml-1 mt-1" size="25" />
                    <p className="text-2xl font-extrabold mt-6 text-primary dark:text-[#FFADFB]">
                      {formatNumber(networkStatus.totalAddresses)}
                    </p>
                    <Label className="text-sm opacity-50">{t("Total Addresses")}</Label>
                  </div>
                </div>
                <div className="flex items-center justify-center h-full w-1/2 p-2">
                  <div className="text-center py-10 w-full relative network-box h-full">
                    <Hourglass className="absolute top-0 left-0 ml-1 mt-1" size="25" />
                    <p className="text-2xl font-extrabold mt-6 text-primary dark:text-[#FFADFB]">
                      {networkStatus.avgBlockInterval} secs
                    </p>
                    <Label className="text-sm opacity-50">
                      {t("AVG Block Intervals")}
                    </Label>
                  </div>
                </div>
                <div className="flex items-center justify-center h-full w-1/2 p-2">
                  <div className="text-center py-10 w-full relative network-box h-full">
                    <HandCoins className="absolute top-0 left-0 ml-1 mt-1" size="25" />
                    <p className="text-2xl font-extrabold mt-6 text-primary dark:text-[#FFADFB]">
                      {networkStatus.lastGasFee}
                    </p>
                    <Label className="text-sm opacity-50">{t("Last Gas Fee")}</Label>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </>
  )
}

export default IndexNetworkStatus
