import Header from "@/components/header"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { NetworkModel } from "@/models/network.model"
import { CurrentPageService } from "@/services/current-page.service"
import { NetworkService } from "@/services/network.service"
import { ApiPromise } from "@polkadot/api"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexImportWalletPage from "../import-wallet"
import IndexBalance from "./balance"
import IndexImUrAi from "./imurai"
import Layout from "./layout"
import IndexNetworkStatus from "./network-status"
import IndexPumpToken from "./pump-token"
import IndexTokens from "./tokens"
import IndexWallets from "./wallets"

const IndexApplication = () => {
  const { t } = useTranslation()

  const networkService = useMemo(() => new NetworkService(), [])
  const currentPageService = useMemo(() => new CurrentPageService(), [])

  const [currentPage, setCurrentPage] = useState<string>(t("Balance"))

  const [currentNetwork, setCurrentNetwork] = useState<NetworkModel | null>(null)
  const [currentWsAPI, setCurrentWsAPI] = useState<ApiPromise | null>(null)

  const getCurrentPage = () => {
    currentPageService.getCurrentPage().then((data) => {
      if (data != null) {
        setCurrentPage(data)
      } else {
        currentPageService.setCurrentPage(t("Balance"))
      }
    })
  }

  useEffect(() => {
    getCurrentPage()
  }, [])

  const handleSetCurrentPage = (currentPage: string) => {
    setCurrentPage(currentPage)
    currentPageService.setCurrentPage(currentPage)
  }

  const handleCurrentNetwork = async (network: NetworkModel) => {
    setCurrentNetwork(network)

    const wsAPI = await networkService.connectRPC(network.rpc)
    if (wsAPI.isReady) {
      setCurrentWsAPI(wsAPI)
    }
  }

  return (
    <main className="max-h-screen">
      {currentPage === "import-wallet" ? (
        <IndexImportWalletPage handleCallbacks={handleSetCurrentPage} />
      ) : (
        <Layout onSetCurrentPage={handleSetCurrentPage}>
          <div className="background-inside-theme">
            <Header
              currentPage={currentPage}
              handleCurrentNetwork={handleCurrentNetwork}
            />
            <div className="h-[calc(100vh-60px)]">
              <ScrollArea className="px-4 h-full">
                {currentPage === t("Balance") && (
                  <IndexBalance
                    currentNetwork={currentNetwork}
                    currentWsAPI={currentWsAPI}
                  />
                )}
                {currentPage === t("Tokens") && (
                  <IndexTokens
                    currentNetwork={currentNetwork}
                    currentWsAPI={currentWsAPI}
                  />
                )}
                {currentPage === t("Network Status") && (
                  <IndexNetworkStatus
                    currentNetwork={currentNetwork}
                    currentWsAPI={currentWsAPI}
                  />
                )}
                {currentPage === t("Wallets") && (
                  <IndexWallets
                    currentNetwork={currentNetwork}
                    currentWsAPI={currentWsAPI}
                    handleSetCurrentPage={handleSetCurrentPage}
                  />
                )}
                {currentPage === t("Support") && <IndexImUrAi />}
                {currentPage === t("Pump") && (
                  <IndexPumpToken
                    currentNetwork={currentNetwork}
                    currentWsAPI={currentWsAPI}
                  />
                )}
              </ScrollArea>
            </div>
          </div>
        </Layout>
      )}
    </main>
  )
}

export default IndexApplication
