import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import React, { useState } from "react"

import IndexBalance from "./balance"
import IndexImUrAi from "./imurai"
import Layout from "./layout"
import IndexNetworkStatus from "./network-status"
import IndexTokens from "./tokens"
import IndexWallets from "./wallets"
import Header from "@/components/Header"

const IndexApplication = () => {
  const [currentPage, setCurrentPage] = useState<string>("")
  const { theme } = useTheme()

  const handleSetCurrentPage = (currentPage: string) => {
    setCurrentPage(currentPage)
  }

  return (
    <>
      <Layout onSetCurrentPage={handleSetCurrentPage}>
        <Header
            currentPage={currentPage}
            onSetCurrentPage={handleSetCurrentPage}
        />
          {theme === "light" && (
            <Separator orientation="vertical" className="mr-2 h-4" />
          )}
          {theme === "dark" && (
            <Separator orientation="vertical" className="mr-2 h-4 bg-white" />
          )}
          {theme === "system" && (
            <Separator orientation="vertical" className="mr-2 h-4 bg-white" />
          )}
          

        <div className="px-4">
          {currentPage === "Balance" && <IndexBalance />}
          {currentPage === "Tokens" && <IndexTokens />}
          {currentPage === "Network Status" && <IndexNetworkStatus />}
          {currentPage === "Wallets" && <IndexWallets />}
          {currentPage === "ImUrAi" && <IndexImUrAi />}
        </div>
      </Layout>
    </>
  )
}

export default IndexApplication
