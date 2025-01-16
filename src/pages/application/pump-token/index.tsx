import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { NetworkModel } from "@/models/network.model"
import type { PumpTokenModel } from "@/models/pump-token.model"
import { NetworkService } from "@/services/network.service"
import { PumpTokenService } from "@/services/pump-token.service"
import { Search } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexAddPumpToken from "./addPumpToken"
import IndexPumpTokenDetails from "./pump-token-details"

const truncateText = (text, limit) => {
  return text.length > limit ? `${text.slice(0, limit)}...` : text
}

const IndexPumpToken = () => {
  const { t } = useTranslation()
  const networkService = new NetworkService()
  const pumpTokenService = new PumpTokenService()

  const [openSearchToken, setOpenSearchTokens] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPumpTokenDetailsDrawerOpen, setIsPumpTokenDetailsDrawerOpen] = useState(false)
  const [isAddPumpTokenDrawerOpen, setIsAddPumpTokenDrawerOpen] = useState<boolean>(false)
  const [selectedInSearchToken, setSelectedInSearchToken] =
    useState<PumpTokenModel | null>(null)
  const [pumpTokens, setPumpTokens] = useState<PumpTokenModel[]>([])
  const [pumpTokenData, setPumpTokenData] = useState<PumpTokenModel>({
    id: 0,
    name: "",
    symbol: "",
    creator: "",
    contract: "",
    description: "",
    marketCap: 0,
    price: 0,
    virtualLiquidity: 0,
    volume24h: 0,
    tokenCreated: new Date(),
    percentage: 0,
    image_url: undefined,
    network: "Xode",
    network_id: 0
  })
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  const getPumpTokens = () => {
    pumpTokenService.getPumpTokens().then((data) => {
      setPumpTokens(data)
    })
  }

  useEffect(() => {
    getNetwork()
    getPumpTokens()
  }, [])

  const handleTokenClick = (token: PumpTokenModel) => {
    setPumpTokenData(token)
    setIsPumpTokenDetailsDrawerOpen(true)
  }

  const addPumpToken = () => {
    setIsAddPumpTokenDrawerOpen(true)
  }

  const saveAndUpdatePumpToken = () => {
    setIsAddPumpTokenDrawerOpen(false)

    setTimeout(() => {
      getPumpTokens()
    }, 100)
  }

  const filteredTokens = pumpTokens.filter(
    (token: PumpTokenModel) =>
      (!searchQuery || token.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedNetwork ? token.network === selectedNetwork.name : true)
  )

  const formatCurrency = (amount) => {
    if (!amount) return "$0.0"; 
    const num = parseFloat(amount.replace(/,/g, '')); 
    if (isNaN(num)) return "$0.0"; 
  
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}k`; 
    }
    return `$${num.toFixed(1)}`; 
  };

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          <div className="mb-3">
            <Label className="font-bold text-muted">{t("Search")}</Label>
            <Popover open={openSearchToken} onOpenChange={setOpenSearchTokens}>
              <PopoverTrigger asChild>
                <Button
                  variant="roundedOutline"
                  role="combobox"
                  aria-expanded={openSearchToken}
                  className="w-full justify-between text-input-primary p-3 font-bold hover:bg-accent"
                  size="lg">
                  {selectedInSearchToken ? (
                    <>
                      <span className="text-muted">
                        {selectedInSearchToken.name} &nbsp;
                        {"("}
                        {selectedInSearchToken.symbol}
                        {")"}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted opacity-70">
                      {t("Search for Tokens")}
                    </span>
                  )}
                  <Search />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popper-anchor-width)" }}>
                <Command>
                  <CommandInput
                    placeholder={t("Enter Token Name")}
                    value={
                      selectedInSearchToken
                        ? `${selectedInSearchToken.name}`
                        : searchQuery
                    }
                    onValueChange={(value) => {
                      setSearchQuery(value)
                      if (value === "") {
                        setSelectedInSearchToken(null)
                      }
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>{t("No results found.")}</CommandEmpty>
                    <CommandGroup>
                      {filteredTokens.map((token) => (
                        <CommandItem
                          key={token.id}
                          value={token.name}
                          onSelect={() => {
                            setSelectedInSearchToken(token)
                            setOpenSearchTokens(false)
                          }}
                          className="cursor-pointer hover:bg-accent">
                          {token.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex grid grid-cols-2 sm:grid-cols-2 gap-4">
            {selectedInSearchToken ? (
              <div
                key={selectedInSearchToken.id}
                className="flex flex-col items-start justify-between border-2 border-primary dark:border-border dark:bg-muted/50 rounded-xl h-full"
                onClick={() => handleTokenClick(selectedInSearchToken)}>
                <div className="w-full flex justify-center mb-4">
                  <img
                    src={selectedInSearchToken.image_url}
                    alt={selectedInSearchToken.name}
                    className="h-36 w-full object-cover object-center rounded-lg"
                  />
                </div>
                <h3 className="font-bold text-sm pl-2">
                  {selectedInSearchToken.name} ($ {selectedInSearchToken.symbol})
                </h3>
                <p className="pl-2 mt-1">
                  Created by:{" "}
                  <span className="text-muted p-4 underline">
                    {selectedInSearchToken.creator}
                  </span>
                </p>
                <p className="pl-2 pr-2 opacity-50 leading-snug mt-1 mb-1">
                  {truncateText(selectedInSearchToken.description, 50)}
                </p>
                <p>
                  <span className="opacity-50 pl-2">Market Cap:</span>
                  <span className="font-bold p-4">{selectedInSearchToken.marketCap}</span>
                  <span className="font-bold p-4">{formatCurrency(selectedInSearchToken.marketCap)}</span>                </p>
              </div>
            ) : (
              filteredTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex flex-col items-start justify-between border-2 border-primary dark:border-border dark:bg-muted/50 rounded-xl h-full"
                  onClick={() => handleTokenClick(token)}>
                  <div className="w-full flex justify-center mb-4">
                    <img
                      src={token.image_url}
                      alt={token.name}
                      className="h-40 w-full object-cover object-center rounded-lg"
                    />
                  </div>
                  <h3 className="font-bold text-sm pl-2">
                    {token.name} ($ {token.symbol})
                  </h3>
                  <p className="pl-2 mt-1">
                    Created by:{" "}
                    <span className="text-muted p-4 underline font-semibold">{token.creator}</span>
                  </p>
                  <p className="pl-2 pr-2 opacity-50 leading-snug mt-1 mb-1">
                    {truncateText(token.description, 50)}
                  </p>
                  <p>
                    <span className="opacity-50 pl-2">Market Cap:</span>
                    <span className="font-bold p-4">{formatCurrency(token.marketCap)}</span>
                    <span className="opacity-50">({token.percentage}%)</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        <Button variant="jelly" className="my-auto" onClick={addPumpToken}>
          {t("ADD NEW TOKEN")}
        </Button>
      </div>
      <Drawer
        open={isPumpTokenDetailsDrawerOpen}
        onOpenChange={setIsPumpTokenDetailsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
              {pumpTokenData
                ? `${pumpTokenData.name} (${pumpTokenData.symbol})`
                : "Loading..."}
            </DrawerTitle>
          </DrawerHeader>
          {pumpTokenData ? (
            <IndexPumpTokenDetails
              selectedPumpTokens={pumpTokenData}
              handleCallbacks={() => {}}
            />
          ) : (
            <p>{t("Loading...")}</p>
          )}
        </DrawerContent>
      </Drawer>
      <Drawer open={isAddPumpTokenDrawerOpen} onOpenChange={setIsAddPumpTokenDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
              {t("ADD NEW PUMP TOKEN")}
            </DrawerTitle>
          </DrawerHeader>
          <IndexAddPumpToken handleCallbacks={saveAndUpdatePumpToken} />
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexPumpToken
