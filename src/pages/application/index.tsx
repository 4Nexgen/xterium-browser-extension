import Header from "@/components/header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CurrentPageService } from "@/services/current-page.service"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexBalance from "./balance"
import IndexImUrAi from "./imurai"
import Layout from "./layout"
import IndexNetworkStatus from "./network-status"
import IndexTokens from "./tokens"
import IndexWallets from "./wallets"

const IndexApplication = () => {
  const { t } = useTranslation()

  const currentPageService = new CurrentPageService()

  const [currentPage, setCurrentPage] = useState<string>(t("Balance"))

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

  return (
    <main className="max-h-screen">
      <Layout onSetCurrentPage={handleSetCurrentPage}>
        <div className="background-inside-theme">
          <Header currentPage={currentPage} />
          <div className="h-[calc(100vh-60px)]">
            <ScrollArea className="px-4 h-full">
              {currentPage === t("Balance") && <IndexBalance />}
              {currentPage === t("Tokens") && <IndexTokens />}
              {currentPage === t("Network Status") && <IndexNetworkStatus />}
              {currentPage === t("Wallets") && <IndexWallets />}
              {currentPage === t("Support") && <IndexImUrAi />}
            </ScrollArea>
          </div>
        </div>
      </Layout>
    </main>
  )
}

export default IndexApplication
