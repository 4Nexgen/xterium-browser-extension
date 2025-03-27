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
import { ChainAssetFiles } from "@/data/chains/chain-asset-files"
import type { NetworkModel } from "@/models/network.model"
import type { TokenModel } from "@/models/token.model"
import { TokenService } from "@/services/token.service"
import type { ApiPromise } from "@polkadot/api"
import { Coins, LoaderCircle, Search } from "lucide-react"
import Image from "next/image"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexPumpTokenDetails from "./pump-token-details"

interface IndexPumpTokenProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
}

const IndexPumpToken = ({ currentNetwork, currentWsAPI }: IndexPumpTokenProps) => {
  const { t } = useTranslation()

  const tokenService = useMemo(() => new TokenService(), [])

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [pumpTokens, setPumpTokens] = useState<TokenModel[]>([])
  const [pumpTokenLogoMap, setPumpTokenLogoMap] = useState<{ [key: string]: string }>({})
  const [selectedPumpToken, setSelectedPumpToken] = useState<TokenModel | null>(null)

  const [openSearchToken, setOpenSearchTokens] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const [isPumpTokenDetailsDrawerOpen, setIsPumpTokenDetailsDrawerOpen] = useState(false)
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

  const getTokens = async () => {
    if (wsAPI !== null) {
      const tokens = await tokenService.getTokens(network, wsAPI)
      const pumpTokens = tokens.filter((d) => d.type === "Pump")
      setPumpTokens(pumpTokens)
      await getPumpTokenLogos(pumpTokens)

      setLoading(false)
    }
  }

  useEffect(() => {
    if (wsAPI !== null) {
      getTokens()
    }
  }, [wsAPI])

  const getPumpTokenLogos = async (tokens: TokenModel[]) => {
    const tokenAssetFiles = await ChainAssetFiles.load(network.name)
    const newImageMap: { [key: string]: string } = {}

    if (tokens.length > 0) {
      for (const token of tokens) {
        newImageMap[token.symbol] = tokenAssetFiles.getTokenLogo(token.symbol)
      }
    }

    setPumpTokenLogoMap(newImageMap)
  }

  const pumpTokenDetails = (token: TokenModel) => {
    setSelectedPumpToken(token)
    setIsPumpTokenDetailsDrawerOpen(true)
  }

  const truncateText = (text, limit) => {
    return text && text.length > limit ? `${text.slice(0, limit)}...` : text || ""
  }

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
            <>
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
                      {searchQuery ? (
                        <span className="text-muted">{searchQuery}</span>
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
                        value={searchQuery}
                        onValueChange={(value) => {
                          setSearchQuery(value)
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>{t("No results found.")}</CommandEmpty>
                        <CommandGroup>
                          {pumpTokens
                            .filter(
                              (token) =>
                                searchQuery === "" ||
                                token.name
                                  .toLowerCase()
                                  .startsWith(searchQuery.toLowerCase())
                            )
                            .map((token) => (
                              <CommandItem
                                key={token.id}
                                value={token.name || ""}
                                onSelect={() => {
                                  setSearchQuery(token.name || "")
                                  setOpenSearchTokens(false)
                                }}
                                className="cursor-pointer hover:bg-accent">
                                {token.name || t("No Name Available")}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {pumpTokens.length > 0 ? (
                <>
                  <div className="flex grid grid-cols-2 gap-4">
                    {pumpTokens
                      .filter(
                        (pumpToken) =>
                          searchQuery === "" ||
                          pumpToken.name
                            .toLowerCase()
                            .startsWith(searchQuery.toLowerCase())
                      )
                      .map((pumpToken) => (
                        <div
                          key={pumpToken.id}
                          className="flex flex-col items-start justify-between border-2 border-primary dark:border-border dark:bg-muted/50 rounded-xl h-full hover:cursor-pointer"
                          onClick={() => pumpTokenDetails(pumpToken)}>
                          <div className="w-full flex justify-center mb-4">
                            <Image
                              src={
                                pumpTokenLogoMap[pumpToken.symbol] ||
                                "/assets/tokens/default.png"
                              }
                              alt={pumpToken.name || "Token Image"}
                              width={40}
                              height={40}
                              className="h-36 w-full object-cover object-center rounded-lg"
                            />
                          </div>
                          <h3 className="font-bold text-sm pl-2">
                            {pumpToken.name || "No Name Available"} (
                            {pumpToken.symbol || "N/A"})
                          </h3>
                          <p className="pl-2 mt-1">
                            {t("Created by")}:
                            <span className="text-muted p-4 underline">
                              {pumpToken.owner
                                ? `${pumpToken.owner.slice(0, 4)}...${pumpToken.owner.slice(-4)}`
                                : "Unknown"}
                            </span>
                          </p>
                          <p className="pl-2 pr-2 opacity-50 leading-snug mt-1 mb-1">
                            {truncateText(pumpToken.description, 50)}
                          </p>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col w-full items-center justify-center py-[100px] space-y-2">
                  <Coins className="size-20" />
                  <h4 className="font-bold text-lg">{t("Empty")}</h4>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer
        open={isPumpTokenDetailsDrawerOpen}
        onOpenChange={setIsPumpTokenDetailsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
              {selectedPumpToken
                ? `${selectedPumpToken.name} (${selectedPumpToken.symbol})`
                : "Loading..."}
            </DrawerTitle>
          </DrawerHeader>
          {selectedPumpToken ? (
            <IndexPumpTokenDetails
              currentNetwork={network}
              currentWsAPI={wsAPI}
              currentPumpToken={selectedPumpToken}
            />
          ) : (
            <p>{t("Loading...")}</p>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexPumpToken
