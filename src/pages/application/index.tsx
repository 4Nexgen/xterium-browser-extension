import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Coins, DollarSign, MessageCircle, Network, Wallet } from "lucide-react"
import React, { useState } from "react"

import IndexAssets from "./assets"
import IndexBalance from "./balance"
import IndexImUrAi from "./imurai"
import Layout from "./layout"
import IndexNetworkStatus from "./network-status"
import IndexWallets from "./wallets"

const IndexApplication = () => {
  const [currentPage, setCurrentPage] = useState<string>("")

  const handleSetCurrentPage = (currentPage: string) => {
    setCurrentPage(currentPage)
  }

  return (
    <>
      <Layout onSetCurrentPage={handleSetCurrentPage}>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {currentPage === "Balance" && (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {currentPage !== "Balance" && (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="#"
                      onClick={() => setCurrentPage("Balance")}>
                      Balance
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-4">
          <div className="w-full">
            <span className="text-xl font-bold flex flex-1">
              {currentPage === "Balance" && <DollarSign size="26" />}
              {currentPage === "Assets" && <Coins size="26" />}
              {currentPage === "Network Status" && <Network size="26" />}
              {currentPage === "Wallets" && <Wallet size="26" />}
              {currentPage === "ImUrAi" && <MessageCircle size="26" />}
              &nbsp;
              {currentPage}
            </span>
          </div>
        </div>

        <div className="px-4 py-2">
          {currentPage === "Balance" && <IndexBalance />}
          {currentPage === "Assets" && <IndexAssets />}
          {currentPage === "Network Status" && <IndexNetworkStatus />}
          {currentPage === "Wallets" && <IndexWallets />}
          {currentPage === "ImUrAi" && <IndexImUrAi />}
        </div>
      </Layout>
    </>
  )
}

export default IndexApplication
