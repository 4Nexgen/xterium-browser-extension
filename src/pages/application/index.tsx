import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import AZKLogo from "data-base64:/assets/tokens/azk.png"
import IXONLogo from "data-base64:/assets/tokens/ixon.png"
import XAVLogo from "data-base64:/assets/tokens/xav.png"
import XGMLogo from "data-base64:/assets/tokens/xgm.png"
import XONLogo from "data-base64:/assets/tokens/xon.png"
import { Check, ChevronsUpDown } from "lucide-react"
import { useTheme } from "next-themes"
import React, { useState } from "react"

import IndexBalance from "./balance"
import IndexImUrAi from "./imurai"
import Layout from "./layout"
import IndexNetworkStatus from "./network-status"
import IndexTokens from "./tokens"
import IndexWallets from "./wallets"

const networks = [
  {
    value: "Mainnet",
    label: "Mainnet"
  },
  {
    value: "Testnet",
    label: "Testnet"
  }
]

const IndexApplication = () => {
  const [currentPage, setCurrentPage] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const { theme } = useTheme()

  const handleSetCurrentPage = (currentPage: string) => {
    setCurrentPage(currentPage)
  }

  return (
    <>
      <Layout onSetCurrentPage={handleSetCurrentPage}>
        <header className="flex top-0 h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="p-2" />
          {theme === "light" && (
            <Separator orientation="vertical" className="mr-2 h-4" />
          )}
          {theme === "dark" && (
            <Separator orientation="vertical" className="mr-2 h-4 bg-white" />
          )}
          {theme === "system" && (
            <Separator orientation="vertical" className="mr-2 h-4 bg-white" />
          )}
          <Breadcrumb className="w-full">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <b>{currentPage}</b>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="w-[200px]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="roundedOutline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full float-right"
                  size="lg">
                  <img src={XONLogo} className="w-2/12" />{" "}
                  {value
                    ? networks.find((network) => network.value === value)?.label
                    : "Select network"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search network..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No network found.</CommandEmpty>
                    <CommandGroup>
                      {networks.map((network) => (
                        <CommandItem
                          key={network.value}
                          value={network.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue)
                            setOpen(false)
                          }}>
                          {network.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === network.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* <div className="p-4">
          <div className="w-full">
            <span className="text-xl font-bold flex flex-1">
              {currentPage === "Balance" && <DollarSign size="26" />}
              {currentPage === "Tokens" && <Coins size="26" />}
              {currentPage === "Network Status" && <Network size="26" />}
              {currentPage === "Wallets" && <Wallet size="26" />}
              {currentPage === "ImUrAi" && <MessageCircle size="26" />}
              &nbsp;
              {currentPage}
            </span>
          </div>
        </div> */}

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
