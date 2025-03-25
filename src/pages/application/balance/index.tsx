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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TokenImages } from "@/data/token.data"
import { BalanceModel } from "@/models/balance.model"
import { NetworkModel } from "@/models/network.model"
import { WalletModel } from "@/models/wallet.model"
import { TokenService } from "@/services/token.service"
import { WalletService } from "@/services/wallet.service"
import { ApiPromise } from "@polkadot/api"
import { Coins } from "lucide-react"
import Image from "next/image"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexBalanceDetails from "./balance-details"

interface IndexBalanceProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
}

const IndexBalance = ({ currentNetwork, currentWsAPI }: IndexBalanceProps) => {
  const { t } = useTranslation()

  const walletService = useMemo(() => new WalletService(), [])
  const tokenService = useMemo(() => new TokenService(), [])

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [openWallets, setOpenWallets] = useState<boolean>(false)
  const [wallets, setWallets] = useState<WalletModel[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletModel | null>(null)
  const [balances, setBalances] = useState<BalanceModel[]>([])
  const [loadingPerToken, setLoadingPerToken] = useState({})

  const [isTokenDetailDrawerOpen, setIsTokenDetailDrawerOpen] = useState<boolean>(false)
  const [selectedBalance, setSelectedBalance] = useState<BalanceModel | null>(null)

  useEffect(() => {
    if (currentNetwork) {
      setNetwork(currentNetwork)
    }
  }, [currentNetwork])

  useEffect(() => {
    if (currentWsAPI) {
      setWsAPI(currentWsAPI)
    }
  }, [currentWsAPI])

  const getWallets = async () => {
    const data = await walletService.getWallets()
    setWallets(data)
    setSelectedWallet(data[0])
  }

  useEffect(() => {
    getWallets()
  }, [wsAPI])

  const fixBalance = (value: string, decimal: number) => {
    const multiplier = 10 ** decimal
    return parseFloat(value) / multiplier
  }

  const updateBalances = (balance: BalanceModel) => {
    setLoadingPerToken((prevLoadingPerToken) => ({
      ...prevLoadingPerToken,
      [balance.token.symbol]: false
    }))

    setBalances((prevBalances) =>
      prevBalances.map((prevBalance) =>
        prevBalance.token.id === balance.token.id
          ? {
              ...prevBalance,
              freeBalance: balance.freeBalance,
              reservedBalance: balance.reservedBalance
            }
          : prevBalance
      )
    )
  }

  const getBalances = async () => {
    try {
      const data = await tokenService.getTokens()
      let emptyBalances: BalanceModel[] = []

      if (data.length > 0) {
        const uniqueTokens = new Set()

        for (let i = 0; i < data.length; i++) {
          setLoadingPerToken((prevLoadingPerToken) => ({
            ...prevLoadingPerToken,
            [data[i].symbol]: true
          }))

          let token = data[i]

          if (!uniqueTokens.has(token.symbol)) {
            uniqueTokens.add(token.symbol)

            emptyBalances.push({
              owner: selectedWallet.public_key,
              token: token,
              freeBalance: 0,
              reservedBalance: 0,
              is_frozen: false
            })
          }
        }
      }

      setBalances(emptyBalances)

      if (selectedWallet) {
        const sortedEmptyBalances = [...emptyBalances].sort(
          (a, b) => a.token.id - b.token.id
        )

        sortedEmptyBalances.map((balance) => {
          if (balance.token.type == "Native") {
            wsAPI.query.system.account(balance.owner, (systemAccountInfo) => {
              const { free, reserved } = (systemAccountInfo.toJSON() as any).data

              updateBalances({
                ...balance,
                freeBalance: fixBalance(free.toString(), 12),
                reservedBalance: fixBalance(reserved.toString(), 12),
                is_frozen: false
              })
            })
          }

          if (balance.token.type === "Asset") {
            wsAPI.query.assets.account(
              balance.token.id,
              balance.owner,
              (assetAccountInfo) => {
                const humanData = (assetAccountInfo.toHuman() as { [key: string]: any })
                  ?.balance
                const free = humanData ? parseInt(humanData.split(",").join("")) : 0

                updateBalances({
                  ...balance,
                  freeBalance: fixBalance(free.toString(), 12),
                  reservedBalance: fixBalance("0", 12),
                  is_frozen: false
                })
              }
            )
          }
        })
      }
    } catch (error) {
      console.error("Error fetching balances:", error)
    }
  }

  useEffect(() => {
    if (selectedWallet !== null) {
      getBalances()
    }
  }, [selectedWallet])

  const getTokenImage = (imageName: string) => {
    const tokenImages = new TokenImages()
    return tokenImages.getBase64Image(imageName)
  }

  const selectBalance = (data: BalanceModel) => {
    setIsTokenDetailDrawerOpen(true)
    setSelectedBalance(data)
  }

  const handleTransferCompleteCallbacks = () => {
    setIsTokenDetailDrawerOpen(false)
    getBalances()
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          <div className="mb-3">
            <Label className="text-muted font-bold">{t("Address")}</Label>
            <Popover open={openWallets} onOpenChange={setOpenWallets}>
              <PopoverTrigger asChild>
                <Button
                  variant="roundedOutline"
                  role="combobox"
                  aria-expanded={openWallets}
                  className="w-full justify-between text-input-primary p-3 font-bold hover:bg-accent"
                  size="lg">
                  {selectedWallet ? (
                    <>
                      <span className="text-muted">
                        {selectedWallet.name} &nbsp;
                        {"("}
                        {selectedWallet.public_key.slice(0, 6)}...
                        {selectedWallet.public_key.slice(-6)}
                        {")"}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted opacity-70">{t("Select wallet")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popper-anchor-width)" }}>
                <Command>
                  <CommandInput placeholder={t("Choose wallet")} />
                  <CommandList>
                    <CommandEmpty>{t("No results found.")}</CommandEmpty>
                    <CommandGroup>
                      {wallets
                        .filter(
                          (wallet) =>
                            wallet.address_type === (network ? network.name : "")
                        )
                        .map((wallet) => (
                          <CommandItem
                            key={wallet.id}
                            value={wallet.name}
                            onSelect={() => {
                              setSelectedWallet(wallet)
                              setOpenWallets(false)
                            }}
                            className="cursor-pointer hover:bg-accent">
                            {wallet ? (
                              <>
                                {wallet.name} &nbsp;
                                {"("}
                                {wallet.public_key.slice(0, 6)}...
                                {wallet.public_key.slice(-6)}
                                {")"}
                              </>
                            ) : (
                              t("Select address")
                            )}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {balances?.filter(
            (item) => item.token.network == (network != null ? network.name : "")
          )?.length ? (
            <>
              <Card className="mb-3">
                <Table>
                  <TableBody>
                    {balances
                      .filter(
                        (balance) =>
                          balance.token.network === (network ? network.name : "")
                      )
                      .sort((a, b) => {
                        if (a.token.type === "Native" && b.token.type !== "Native")
                          return -1
                        if (a.token.type !== "Native" && b.token.type === "Native")
                          return 1
                        return 0
                      })
                      .map((balance) => (
                        <TableRow
                          key={balance.token.id}
                          onClick={() => {
                            if (!loadingPerToken[balance.token.symbol]) {
                              selectBalance(balance)
                            }
                          }}
                          className={`cursor-pointer hover-bg-custom ${
                            loadingPerToken[balance.token.symbol]
                              ? "cursor-not-allowed"
                              : ""
                          }`}>
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
                              {loadingPerToken[balance.token.symbol] ? (
                                <span className="text-sm font-normal opacity-50">
                                  Loading...
                                </span>
                              ) : (
                                balance.freeBalance.toString()
                              )}
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
                      <div className="flex justify-center items-center w-full border-b border-border-1/20 pb-4 text-muted">
                        {selectedBalance ? (
                          <Image
                            src={getTokenImage(selectedBalance.token.image_url)}
                            alt={selectedBalance.token.symbol}
                            width={32}
                            height={32}
                            className="mr-2"
                          />
                        ) : (
                          <div>{t("No Image")}</div>
                        )}
                        <DrawerTitle>
                          {selectedBalance ? selectedBalance.token.symbol : ""}
                        </DrawerTitle>
                      </div>
                    </DrawerHeader>
                    <IndexBalanceDetails
                      currentWsAPI={wsAPI}
                      selectedBalance={selectedBalance}
                      handleTransferCompleteCallbacks={handleTransferCompleteCallbacks}
                    />
                  </DrawerContent>
                </Drawer>
              </Card>
            </>
          ) : (
            <div className="flex flex-col gap-4 items-center py-[100px]">
              <Coins className="size-20" />
              <div className="text-center">
                <h4 className="font-bold text-lg">{t("No Token Found")}</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default IndexBalance
