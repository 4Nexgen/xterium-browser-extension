import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ChainAssetFiles } from "@/data/chains/chain-asset-files"
import type { NetworkModel } from "@/models/network.model"
import { TokenModel } from "@/models/token.model"
import { TokenService } from "@/services/token.service"
import type { ApiPromise } from "@polkadot/api"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import { Coins, LoaderCircle } from "lucide-react"
import Image from "next/image"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

// import { Button } from "@/components/ui/button"
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger
// } from "@/components/ui/tooltip"
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger
// } from "@/components/ui/drawer"

// import { toast } from "@/hooks/use-toast"

// import IndexAddToken from "./addToken"
// import IndexDeleteToken from "./deleteToken"
// import IndexEditToken from "./editToken"

interface IndexTokensProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
}

const IndexTokens = ({ currentNetwork, currentWsAPI }: IndexTokensProps) => {
  const { t } = useTranslation()

  const tokenService = useMemo(() => new TokenService(), [])

  const [network, setNetwork] = useState<NetworkModel | null>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [tokens, setTokens] = useState<TokenModel[]>([])
  const [tokenLogoMap, setTokenLogoMap] = useState<{ [key: string]: string }>({})

  const [loading, setLoading] = useState<boolean>(true)

  // const [selectedToken, setSelectedToken] = useState<TokenModel>({
  //   id: 0,
  //   type: "",
  //   token_id: 0,
  //   network: "",
  //   symbol: "",
  //   description: "",
  //   decimals: 0,
  //   price: 0,
  //   image_url: "Default"
  // })

  // const [isAddTokenDrawerOpen, setIsAddTokenDrawerOpen] = useState<boolean>(false)
  // const [isEditTokenDrawerOpen, setIsEditTokenDrawerOpen] = useState<boolean>(false)
  // const [isDeleteTokenDrawerOpen, setIsDeleteTokenDrawerOpen] = useState(false)

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
    const tokens = await tokenService.getTokens(network, wsAPI)
    setTokens(tokens)
    await getTokenLogos(tokens)

    setLoading(false)
  }

  useEffect(() => {
    if (wsAPI !== null) {
      getTokens()
    }
  }, [wsAPI])

  const getTokenLogos = async (tokens: TokenModel[]) => {
    const tokenAssetFiles = await ChainAssetFiles.load(network.name)
    const newImageMap: { [key: string]: string } = {}

    if (tokens.length > 0) {
      for (const token of tokens) {
        newImageMap[token.symbol] = tokenAssetFiles.getTokenLogo(token.symbol)
      }
    }

    setTokenLogoMap(newImageMap)
  }

  // const addToken = () => {
  //   setIsAddTokenDrawerOpen(true)
  // }

  // const editToken = (data: TokenModel) => {
  //   if (data.preloaded) {
  //     toast({
  //       description: (
  //         <div className="flex items-center">
  //           <X className="mr-2 text-red-500" />
  //           {t("This token is preloaded and cannot be edited!")}
  //         </div>
  //       ),
  //       variant: "default"
  //     })
  //     return
  //   }
  //   setIsEditTokenDrawerOpen(true)
  //   setSelectedToken(data)
  // }

  // const deleteToken = (data: TokenModel) => {
  //   if (data.preloaded) {
  //     toast({
  //       description: (
  //         <div className="flex items-center">
  //           <X className="mr-2 text-red-500" />
  //           {t("This token is preloaded and cannot be deleted!")}
  //         </div>
  //       ),
  //       variant: "default"
  //     })
  //     return
  //   }
  //   setIsDeleteTokenDrawerOpen(true)
  //   setSelectedToken(data)
  // }

  // const saveAndUpdateToken = () => {
  //   setIsAddTokenDrawerOpen(false)
  //   setIsEditTokenDrawerOpen(false)
  //   setIsDeleteTokenDrawerOpen(false)

  //   setTimeout(() => {
  //     getTokens()
  //   }, 100)
  // }

  return (
    <>
      <div className="flex flex-col justify-between h-full gap-4 overflow-hidden">
        <div className="p-4 h-[150px] z-10 flex flex-col items-center justify-center">
          <img src={XteriumLogo} className="w-[150px]" alt="Xterium Logo" />
          <div className="mx-auto px-4 w-full">
            <div className="native-token-background-box w-[300px] mx-auto">
              {tokens
                .filter(
                  (token) =>
                    token.type === "Native" &&
                    token.network === (network ? network.name : "")
                )
                .map((token, index) => (
                  <div key={index} className="p-2 px-8">
                    <h2 className="text-[9px] uppercase font-bold">Native Token</h2>
                    <div className="flex items-center gap-4">
                      <Image
                        src={tokenLogoMap[token.symbol] || "/assets/tokens/default.png"}
                        alt={`${token.description} Logo`}
                        className="ml-1"
                        width={40}
                        height={40}
                      />
                      <div className="flex flex-col">
                        <span className="text-lg font-bold">{token.symbol}</span>
                        <div className="bg-primary rounded-xl border-muted border-1 text-center font-bold px-2">
                          {token.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="px-4 pt-16 -mt-8 flex-1 max-h-[calc(100% - 150px)] bg-red-500 background-box overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center w-full h-30 gap-4 mt-10">
              <LoaderCircle className="animate-spin h-12 w-12 text-muted" />
              <p className="text-muted ml-2 text-lg">
                {loading ? t("Loading...") : t("Loading...")}
              </p>
            </div>
          ) : tokens.length ? (
            <>
              <h1 className="text-center text-xl mb-4">Tokens</h1>
              <ScrollArea className="bg-background rounded-lg p-2 h-[calc(100%-60px)]">
                {tokens
                  .filter((token) => token.type === "Asset" || token.type === "Pump")
                  .map((token) => (
                    <div key={token.id}>
                      <Card className="mb-1 border dark:border-muted">
                        <Table>
                          <TableBody>
                            <TableRow className="cursor-pointer">
                              <TableCell className="w-[50px] justify-center">
                                <Image
                                  src={
                                    tokenLogoMap[token.symbol] ||
                                    "/assets/tokens/default.png"
                                  }
                                  alt={`${token.description} Logo`}
                                  className="ml-1"
                                  width={40}
                                  height={40}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="mb-[2px]">
                                  <span className="text-lg font-bold">
                                    {token.symbol.length > 20
                                      ? token.symbol.substring(0, 20) + "..."
                                      : token.symbol}
                                  </span>
                                </div>
                                <Badge>
                                  {token.description.length > 20
                                    ? token.description.substring(0, 20) + "..."
                                    : token.description}
                                </Badge>
                              </TableCell>
                              <TableCell className="w-[30px] justify-center text-center pr-4">
                                <div className="flex gap-2 items-center">
                                  {/* <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() => editToken(token)}
                                      className={`w-full h-full flex items-center justify-center text-primary dark:text-white ${
                                        token.preloaded
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}>
                                      {" "}
                                      <Pencil />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Edit Token")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() => deleteToken(token)}
                                      className={`w-full h-full flex items-center justify-center text-destructive ${
                                        token.preloaded
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}>
                                      <Trash />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Delete Token")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider> */}
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Card>
                    </div>
                  ))}
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col w-full items-center justify-center py-[100px] space-y-2">
              <Coins className="size-20" />
              <h4 className="font-bold text-lg">{t("Empty")}</h4>
            </div>
            // <div className="flex flex-col gap-4 items-center py-[100px]">
            //   <Coins className="size-20" />
            //   <div className="text-center">
            //     <h4 className="font-bold text-lg">{t("Empty")}</h4>
            //     <p className="opacity-50">
            //       {t("Add new token by clicking the button below.")}
            //     </p>
            //   </div>
            // </div>
          )}
        </div>

        {/* <Button variant="jelly" className="my-auto" onClick={addToken}>
          {t("ADD NEW TOKEN")}
        </Button>

        <Drawer open={isAddTokenDrawerOpen} onOpenChange={setIsAddTokenDrawerOpen}>
          <DrawerContent className="border-0">
            <DrawerHeader>
              <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
                {t("ADD NEW TOKEN")}
              </DrawerTitle>
            </DrawerHeader>
            <IndexAddToken handleCallbacks={saveAndUpdateToken} />
          </DrawerContent>
        </Drawer>

        <Drawer open={isEditTokenDrawerOpen} onOpenChange={setIsEditTokenDrawerOpen}>
          <DrawerTrigger asChild></DrawerTrigger>
          <DrawerContent className="border-0">
            <DrawerHeader>
              <DrawerTitle className="flex items-center justify-center space-x-2 border-b border-border-1/20 pb-4 text-muted">
                <span>{t("Edit")}</span>
                <Image
                  src={getTokenLogo(selectedToken.symbol)}
                  alt={`${selectedToken.symbol} logo`}
                  width={18}
                  height={18}
                  className="rounded"
                />
                <span className="font-bold text-md">{selectedToken.symbol}</span>
                <span>{t("Token")}</span>
              </DrawerTitle>
            </DrawerHeader>
            <IndexEditToken
              selectedToken={selectedToken}
              handleCallbacks={saveAndUpdateToken}
            />
          </DrawerContent>
        </Drawer>

        <Drawer open={isDeleteTokenDrawerOpen} onOpenChange={setIsDeleteTokenDrawerOpen}>
          <DrawerContent className="border-0">
            <DrawerHeader>
              <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
                {t("DELETE TOKEN")}
              </DrawerTitle>
            </DrawerHeader>
            <IndexDeleteToken
              selectedToken={selectedToken}
              handleCallbacks={saveAndUpdateToken}
            />
          </DrawerContent>
        </Drawer> */}
      </div>
    </>
  )
}

export default IndexTokens
