import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { TokenData, TokenImages } from "@/data/token.data"
import { toast } from "@/hooks/use-toast"
import type { NetworkModel } from "@/models/network.model"
import { TokenModel } from "@/models/token.model"
import { NetworkService } from "@/services/network.service"
import { TokenService } from "@/services/token.service"
import { Coins, Pencil, Trash, X } from "lucide-react"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexAddToken from "./addToken"
import IndexDeleteToken from "./deleteToken"
import IndexEditToken from "./editToken"

const IndexTokens = () => {
  const { t } = useTranslation()
  const networkService = new NetworkService()
  const tokenService = new TokenService()

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [tokens, setTokens] = useState<TokenModel[]>([])
  const [selectedToken, setSelectedToken] = useState<TokenModel>({
    id: 0,
    type: "",
    network: "",
    network_id: 0,
    symbol: "",
    description: "",
    image_url: "Default"
  })
  const [isAddTokenDrawerOpen, setIsAddTokenDrawerOpen] = useState<boolean>(false)
  const [isEditTokenDrawerOpen, setIsEditTokenDrawerOpen] = useState<boolean>(false)
  const [isDeleteTokenDrawerOpen, setIsDeleteTokenDrawerOpen] = useState(false)

  const preloadTokens = () => {
    let tokenList: any[] = []

    tokenService.getTokens().then(async (data) => {
      let preloadedTokenData = TokenData
      if (preloadedTokenData.length > 0) {
        for (let i = 0; i < preloadedTokenData.length; i++) {
          let existingToken = data.filter(
            (d) => d.symbol == preloadedTokenData[i].symbol
          )[0]

          if (existingToken != null) {
            tokenList.push({ ...existingToken, preloaded: true })
          } else {
            await tokenService.createToken(preloadedTokenData[i])
            tokenList.push({ ...preloadedTokenData[i], preloaded: true })
          }
        }
      }

      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let existingToken = tokenList.filter((d) => d.symbol == data[i].symbol)[0]

          if (existingToken == null) {
            tokenList.push(data[i])
          }
        }
      }

      setTokens(tokenList)
    })
  }

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  const getTokens = () => {
    preloadTokens()
  }

  const getTokenImage = (imageName: string) => {
    const tokenImages = new TokenImages()
    return tokenImages.getBase64Image(imageName)
  }

  useEffect(() => {
    getNetwork()

    setTimeout(() => {
      getTokens()
    }, 100)
  }, [])

  const addToken = () => {
    setIsAddTokenDrawerOpen(true)
  }

  const editToken = (data: TokenModel) => {
    if (data.preloaded) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("This token is preloaded and cannot be edited!")}
          </div>
        ),
        variant: "default"
      })
      return
    }
    setIsEditTokenDrawerOpen(true)
    setSelectedToken(data)
  }

  const deleteToken = (data: TokenModel) => {
    if (data.preloaded) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("This token is preloaded and cannot be deleted!")}
          </div>
        ),
        variant: "default"
      })
      return
    }
    setIsDeleteTokenDrawerOpen(true)
    setSelectedToken(data)
  }

  const saveAndUpdateToken = () => {
    setIsAddTokenDrawerOpen(false)
    setIsEditTokenDrawerOpen(false)
    setIsDeleteTokenDrawerOpen(false)

    setTimeout(() => {
      getTokens()
    }, 100)
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          {tokens?.filter((item) => item.network == selectedNetwork.name)?.length ? (
            <>
              <Card className="mb-3 card-bg-image border-border">
                <CardHeader>
                  <CardTitle>
                    <b>{t("NATIVE TOKEN")}</b>
                  </CardTitle>
                </CardHeader>
                <Table>
                  <TableBody>
                    {tokens
                      .filter(
                        (token) =>
                          token.type === "Native" &&
                          token.network === (selectedNetwork ? selectedNetwork.name : "")
                      )
                      .map((token) => (
                        <TableRow key={token.symbol}>
                          <TableCell className="w-[50px] justify-center">
                            <Image
                              src={getTokenImage(token.image_url)}
                              alt={`${token.description} Logo`}
                              className="ml-1"
                              width={40}
                              height={40}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="mb-[2px]">
                              <span className="text-lg font-bold">{token.symbol}</span>
                            </div>
                            <Badge>{token.description}</Badge>
                          </TableCell>
                          <TableCell className="w-[30px] justify-center text-center pr-4">
                            <div className="flex gap-2 items-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() => editToken(token)}
                                      className={`w-full h-full flex items-center justify-center text-primary dark:text-white ${
                                        token.preloaded
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}>
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
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="mb-3 border-border">
                <CardHeader>
                  <CardTitle>
                    <b>{t("ASSETS")}</b>
                  </CardTitle>
                </CardHeader>
                <Table>
                  <TableBody>
                    {tokens
                      .filter(
                        (token) =>
                          token.type === "Asset" &&
                          token.network === (selectedNetwork ? selectedNetwork.name : "")
                      )
                      .map((token) => (
                        <TableRow key={token.symbol} className="cursor-pointer">
                          <TableCell className="w-[50px] justify-center">
                            <Image
                              src={getTokenImage(token.image_url)}
                              alt={`${token.description} Logo`}
                              className="ml-1"
                              width={40}
                              height={40}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="mb-[2px]">
                              <span className="text-lg font-bold">{token.symbol}</span>
                            </div>
                            <Badge>{token.description}</Badge>
                          </TableCell>
                          <TableCell className="w-[30px] justify-center text-center pr-4">
                            <div className="flex gap-2 items-center">
                              <TooltipProvider>
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
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <div className="flex flex-col gap-4 items-center py-[100px]">
              <Coins className="size-20" />
              <div className="text-center">
                <h4 className="font-bold text-lg">{t("No Token Found")}</h4>
                <p className="opacity-50">
                  {t("Add new token by clicking the button below.")}
                </p>
              </div>
            </div>
          )}
        </div>

        <Button variant="jelly" className="my-auto" onClick={addToken}>
          {t("ADD NEW TOKEN")}
        </Button>

        <Drawer open={isAddTokenDrawerOpen} onOpenChange={setIsAddTokenDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("ADD NEW TOKEN")}</DrawerTitle>
            </DrawerHeader>
            <IndexAddToken handleCallbacks={saveAndUpdateToken} />
          </DrawerContent>
        </Drawer>

        <Drawer open={isEditTokenDrawerOpen} onOpenChange={setIsEditTokenDrawerOpen}>
          <DrawerTrigger asChild></DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center justify-center space-x-2">
                <span>{t("Edit")}</span>
                <Image
                  src={getTokenImage(selectedToken.image_url)}
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
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("DELETE TOKEN")}</DrawerTitle>
            </DrawerHeader>
            <IndexDeleteToken
              selectedToken={selectedToken}
              handleCallbacks={saveAndUpdateToken}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

export default IndexTokens
