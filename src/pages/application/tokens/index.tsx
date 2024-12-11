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
import { TokenData, TokenImages } from "@/data/token.data"
import { TokenModel } from "@/models/token.model"
import { TokenService } from "@/services/token.service"
import { Pencil } from "lucide-react"
import Image from "next/image"
import React, { useEffect, useState } from "react"

import IndexAddToken from "./addToken"
import IndexEditToken from "./editToken"

const IndexTokens = () => {
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
  const [isAddTokenDrawerOpen, setIsAddTokenDrawerOpen] =
    useState<boolean>(false)
  const [isEditTokenDrawerOpen, setIsEditTokenDrawerOpen] =
    useState<boolean>(false)

  const preloadTokens = () => {
    let tokenList: any[] = []

    let tokenService = new TokenService()
    tokenService.getTokens().then((data) => {
      let preloadedTokenData = TokenData
      if (preloadedTokenData.length > 0) {
        for (let i = 0; i < preloadedTokenData.length; i++) {
          let existingToken = data.filter(
            (d) => d.symbol == preloadedTokenData[i].symbol
          )[0]

          if (existingToken != null) {
            tokenList.push(existingToken)
          } else {
            tokenService.createToken(preloadedTokenData[i])
            tokenList.push(preloadedTokenData[i])
          }
        }
      }

      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let existingToken = tokenList.filter(
            (d) => d.symbol == data[i].symbol
          )[0]

          if (existingToken == null) {
            tokenList.push(data[i])
          }
        }
      }

      setTokens(tokenList)
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
    getTokens()
  }, [])

  const addToken = () => {
    setIsAddTokenDrawerOpen(true)
  }

  const editToken = (data: TokenModel) => {
    setIsEditTokenDrawerOpen(true)
    setSelectedToken(data)
  }

  const saveAndUpdateToken = () => {
    setIsAddTokenDrawerOpen(false)
    setIsEditTokenDrawerOpen(false)

    setTimeout(() => {
      getTokens()
    }, 100)
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          <Card className="mb-3 card-bg-image">
            <CardHeader>
              <CardTitle>
                <b className="text-white">NATIVE TOKEN</b>
              </CardTitle>
            </CardHeader>
            <Table>
              <TableBody>
                {tokens
                  .filter((token) => token.type === "Native")
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
                          <span className="text-lg font-bold text-white">
                            {token.symbol}
                          </span>
                        </div>
                        <Badge>{token.description}</Badge>
                      </TableCell>
                      <TableCell className="w-[50px] justify-end pr-2">
                        <Pencil
                          size="20"
                          color="white"
                          className="cursor-pointer"
                          onClick={() => editToken(token)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="mb-3">
            <CardHeader>
              <CardTitle>
                <b>ASSETS</b>
              </CardTitle>
            </CardHeader>
            <Table>
              <TableBody>
                {tokens
                  .filter((token) => token.type === "Asset")
                  .map((token) => (
                    <TableRow
                      key={token.symbol}
                      className="cursor-pointer hover-bg-custom">
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
                          <span className="text-lg font-bold">
                            {token.symbol}
                          </span>
                        </div>
                        <Badge>{token.description}</Badge>
                      </TableCell>
                      <TableCell className="w-[50px] justify-end pr-2">
                        <Pencil
                          size="20"
                          className="cursor-pointer"
                          onClick={() => editToken(token)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <Button variant="violet" className="my-auto" onClick={addToken}>
          ADD NEW TOKEN
        </Button>

        <Drawer
          open={isAddTokenDrawerOpen}
          onOpenChange={setIsAddTokenDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>ADD NEW TOKEN</DrawerTitle>
            </DrawerHeader>
            <IndexAddToken handleCallbacks={saveAndUpdateToken} />
          </DrawerContent>
        </Drawer>

        <Drawer
          open={isEditTokenDrawerOpen}
          onOpenChange={setIsEditTokenDrawerOpen}>
          <DrawerTrigger asChild></DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center justify-center space-x-2">
                <span>Edit</span>
                <Image
                  src={getTokenImage(selectedToken.image_url)}
                  alt={`${selectedToken.symbol} logo`}
                  width={18}
                  height={18}
                  className="rounded"
                />
                <span className="font-bold text-md">
                  {selectedToken.symbol}
                </span>
                <span>Token</span>
              </DrawerTitle>
            </DrawerHeader>
            <IndexEditToken
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
