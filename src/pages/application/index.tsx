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
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Coins,
  DollarSign,
  Inbox,
  Network,
  Settings,
  User,
  Wallet
} from "lucide-react"
import React, { useState } from "react"

import Layout from "./layout"

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
              &nbsp;
              {currentPage}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50"></div>
            <div className="aspect-video rounded-xl bg-muted/50"></div>
            <div className="aspect-video rounded-xl bg-muted/50"></div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default IndexApplication
