import { setTimeout } from "timers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TokenData, TokenImages } from "@/data/token.data"
import { BalanceModel } from "@/models/balance.model"
import type { NetworkModel } from "@/models/network.model.js"
import { WalletModel } from "@/models/wallet.model"
import { BalanceServices } from "@/services/balance.service"
import { NetworkService } from "@/services/network.service.js"
import { TokenService } from "@/services/token.service"
import { WalletService } from "@/services/wallet.service"
import Image from "next/image"
import React, { useEffect, useState } from "react"

import IndexTokenDetails from "./token-details"

const IndexBalance = () => {
  const networkService = new NetworkService()
  const walletService = new WalletService()
  const tokenService = new TokenService()
  const balanceService = new BalanceServices()

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [openWallets, setOpenWallets] = useState<boolean>(false)
  const [wallets, setWallets] = useState<WalletModel[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletModel>(null)
  const [balances, setBalances] = useState<BalanceModel[]>([])
  const [isTokenDetailDrawerOpen, setIsTokenDetailDrawerOpen] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState<BalanceModel>(null)

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  const getWallets = () => {
    walletService.getWallets().then((data) => {
      setWallets(data)

      setTimeout(() => {
        getTokens()
      }, 100)
    })
  }

  const preloadTokens = () => {
    tokenService.getTokens().then((data) => {
      let preloadedTokenData = TokenData
      if (preloadedTokenData.length > 0) {
        for (let i = 0; i < preloadedTokenData.length; i++) {
          let existingToken = data.filter(
            (d) => d.symbol == preloadedTokenData[i].symbol
          )[0]

          if (existingToken == null) {
            tokenService.createToken(preloadedTokenData[i])
          }
        }
      }

      setTimeout(() => {
        preloadEmptyBalances()
      }, 100)
    })
  }

  const preloadEmptyBalances = () => {
    let emptyBalances: BalanceModel[] = []

    tokenService.getTokens().then((data) => {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let token = data[i]

          emptyBalances.push({
            owner: "",
            token: token,
            freeBalance: 0,
            reservedBalance: 0,
            is_frozen: false
          })
        }
      }

      setBalances(emptyBalances)

      setTimeout(() => {
        getBalances()
      }, 100)
    })
  }

  const getTokens = () => {
    preloadTokens()
  }

  const getTokenImage = (imageName: string) => {
    const tokenImages = new TokenImages()
    return tokenImages.getBase64Image(imageName)
  }

  const fixBalance = (value: string, decimal: number) => {
    const multiplier = 10 ** decimal
    return parseFloat(value) / multiplier
  }

  const getBalances = () => {
    if (balances.length > 0) {
      const zeroOutBalances = balances.map((existingBalance) => {
        let zeroBalance: BalanceModel = {
          ...existingBalance,
          freeBalance: 0,
          reservedBalance: 0,
          is_frozen: false
        }

        return zeroBalance
      })

      setBalances(zeroOutBalances)
    }

    if (selectedWallet != null) {
      balanceService.getBalances(selectedWallet.public_key).then((data) => {
        if (data.length > 0) {
          if (balances.length > 0) {
            const updatedBalances = balances.map((existingBalance) => {
              const match = data.find(
                (data) => data.token.symbol === existingBalance.token.symbol
              )

              if (match) {
                let updatedBalance: BalanceModel = {
                  ...existingBalance,
                  freeBalance: fixBalance(match.freeBalance.toString(), 12),
                  reservedBalance: fixBalance(match.reservedBalance.toString(), 12),
                  is_frozen: match.is_frozen
                }

                return updatedBalance
              }

              return existingBalance
            })

            setBalances(updatedBalances)
          }
        }
      })
    }
  }

  useEffect(() => {
    getNetwork()

    setTimeout(() => {
      getWallets()
    }, 100)
  }, [])

  const selectBalance = (data: BalanceModel) => {
    setIsTokenDetailDrawerOpen(true)

    if (selectedWallet != null) {
      data.owner = selectedWallet.public_key
    }

    setSelectedBalance(data)
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          <div className="mb-3">
            <Label>Address</Label>
            <Popover open={openWallets} onOpenChange={setOpenWallets}>
              <PopoverTrigger asChild>
                <Button
                  variant="roundedOutline"
                  role="combobox"
                  aria-expanded={openWallets}
                  className="w-full justify-between text-input-primary p-3 font-bold"
                  size="lg">
                  {selectedWallet ? (
                    <>
                      {selectedWallet.name} &nbsp;
                      {"("}
                      {selectedWallet.public_key.slice(0, 6)}...
                      {selectedWallet.public_key.slice(-6)}
                      {")"}
                    </>
                  ) : (
                    "Select wallet"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Choose wallet" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {wallets.map((wallet) => (
                        <CommandItem
                          key={wallet.public_key}
                          value={wallet.public_key}
                          onSelect={(value) => {
                            setSelectedWallet(
                              wallets.find((priority) => priority.public_key === value) ||
                                null
                            )
                            setOpenWallets(false)
                            getBalances()
                          }}>
                          {wallet ? (
                            <>
                              {wallet.name} &nbsp;
                              {"("}
                              {wallet.public_key.slice(0, 6)}...
                              {wallet.public_key.slice(-6)}
                              {")"}
                            </>
                          ) : (
                            "Select address"
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Card className="mb-3">
            <Table>
              <TableBody>
                {balances
                  .filter(
                    (balance) =>
                      balance.token.network ===
                      (selectedNetwork ? selectedNetwork.name : "")
                  )
                  .sort((a, b) => {
                    if (a.token.type === "Native" && b.token.type !== "Native") return -1
                    if (a.token.type !== "Native" && b.token.type === "Native") return 1
                    return 0
                  })
                  .map((balance) => (
                    <TableRow
                      key={balance.token.symbol}
                      onClick={() => selectBalance(balance)}
                      className="cursor-pointer hover-bg-custom">
                      <TableCell className="w-[50px] justify-center">
                        <Image
                          src={getTokenImage(balance.token.image_url)}
                          width={40}
                          height={40}
                          alt={balance.token.symbol}
                          className="ml-1"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="mb-[2px]">
                          <span className="text-lg font-bold">
                            {balance.token.symbol}
                          </span>
                        </div>
                        <Badge>{balance.token.description}</Badge>
                      </TableCell>
                      <TableCell className="w-[50px] justify-end pr-2 text-right">
                        <span className="text-lg font-bold text-purple">
                          {balance.freeBalance}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <Drawer
              open={isTokenDetailDrawerOpen}
              onOpenChange={setIsTokenDetailDrawerOpen}>
              <DrawerContent>
                <DrawerHeader>
                  <div className="flex justify-center items-center w-full">
                    {selectedBalance ? (
                      <Image
                        src={getTokenImage(selectedBalance.token.image_url)}
                        alt={selectedBalance.token.symbol}
                        width={32}
                        height={32}
                        className="mr-2"
                      />
                    ) : (
                      <div>No Image</div>
                    )}
                    <DrawerTitle>
                      {selectedBalance ? selectedBalance.token.symbol : ""}
                    </DrawerTitle>
                  </div>
                </DrawerHeader>
                <IndexTokenDetails selectedBalance={selectedBalance} />
              </DrawerContent>
            </Drawer>
          </Card>
        </div>
      </div>
    </>
  )
}

export default IndexBalance
