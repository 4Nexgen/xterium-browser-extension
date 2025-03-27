import { Label } from "@/components/ui/label"
import type { NetworkModel } from "@/models/network.model"
import { XodeService } from "@/services/xode.service"
import type { ApiPromise } from "@polkadot/api"
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
    avgBlockInterval: "0",
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
    const totalBlocks = await xodeService.getTotalBlocks(wsAPI)
    const totalAddresses = await xodeService.getTotalAddresses(wsAPI)

    setNetworkStatus((prevStatus) => ({
      prevStatus,
      totalBlocks,
      totalAddresses,
      avgBlockInterval: "12 secs",
      lastGasFee: 0.002
    }))

    setLoading(false)
  }

  useEffect(() => {
    if (wsAPI !== null) {
      getNetworkStatus()
    }
  }, [wsAPI])

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center w-full h-30 gap-4 mt-10">
              <LoaderCircle className="animate-spin h-12 w-12 text-muted" />
              <p className="text-muted ml-2 text-lg">
                {loading ? t("Loading...") : t("Loading...")}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap">
              <div className="flex items-center justify-center h-full w-1/2 p-2">
                <div className="text-center py-10 w-full relative border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg h-full">
                  <Blocks
                    className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                    size="30"
                  />
                  <p className="text-2xl font-extrabold mt-6 text-primary dark:text-white">
                    {formatNumber(networkStatus.totalBlocks)}
                  </p>
                  <Label className="text-sm opacity-50">{t("Total Blocks")}</Label>
                </div>
              </div>
              <div className="flex items-center justify-center h-full w-1/2 p-2">
                <div className="text-center py-10 w-full relative border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg h-full">
                  <Wallet
                    className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                    size="30"
                  />
                  <p className="text-2xl font-extrabold mt-6 text-primary dark:text-white">
                    {formatNumber(networkStatus.totalAddresses)}
                  </p>
                  <Label className="text-sm opacity-50">{t("Total Addresses")}</Label>
                </div>
              </div>
              <div className="flex items-center justify-center h-full w-1/2 p-2">
                <div className="text-center py-10 w-full relative border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg h-full">
                  <Hourglass
                    className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                    size="30"
                  />
                  <p className="text-2xl font-extrabold mt-6 text-primary dark:text-white">
                    {networkStatus.avgBlockInterval}
                  </p>
                  <Label className="text-sm opacity-50">{t("AVG Block Intervals")}</Label>
                </div>
              </div>
              <div className="flex items-center justify-center h-full w-1/2 p-2">
                <div className="text-center py-10 w-full relative border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg h-full">
                  <HandCoins
                    className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                    size="30"
                  />
                  <p className="text-2xl font-extrabold mt-6 text-primary dark:text-white">
                    {networkStatus.lastGasFee}
                  </p>
                  <Label className="text-sm opacity-50">{t("Last Gas Fee")}</Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default IndexNetworkStatus
