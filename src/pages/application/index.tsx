import Header from "@/components/header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"
import React, { useState } from "react"

import IndexBalance from "./balance"
import IndexImUrAi from "./imurai"
import Layout from "./layout"
import IndexNetworkStatus from "./network-status"
import IndexTokens from "./tokens"
import IndexWallets from "./wallets"

const IndexApplication = () => {
  const [currentPage, setCurrentPage] = useState<string>("")
  const { theme } = useTheme()

  const handleSetCurrentPage = (currentPage: string) => {
    setCurrentPage(currentPage)
  }

  return (
    <main className="max-h-screen">
      <Layout onSetCurrentPage={handleSetCurrentPage}>
        <div>
          <Header
            currentPage={currentPage}
            onSetCurrentPage={handleSetCurrentPage}
          />
          <div className="h-[calc(100vh-60px)]">
            <ScrollArea className="px-4 h-full">
              {currentPage === "Balance" && <IndexBalance />}
              {currentPage === "Tokens" && <IndexTokens />}
              {currentPage === "Network Status" && <IndexNetworkStatus />}
              {currentPage === "Wallets" && <IndexWallets />}
              {currentPage === "ImUrAi" && <IndexImUrAi />}
            </ScrollArea>
          </div>
        </div>
      </Layout>
    </main>
  )
}

export default IndexApplication
