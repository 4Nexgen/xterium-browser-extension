import Loader from "@/components/loader"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { MessageBoxController } from "@/controllers/message-box-controller"
import { ChainAssetFiles } from "@/data/chains/chain-asset-files"
import { BalanceModel } from "@/models/balance.model"
import { NetworkModel } from "@/models/network.model"
import type { TokenModel } from "@/models/token.model"
import { WalletModel } from "@/models/wallet.model"
import { BalanceServices } from "@/services/balance.service"
import { PriceService } from "@/services/price.service"
import { TokenService } from "@/services/token.service"
import { WalletService } from "@/services/wallet.service"
import { ApiPromise } from "@polkadot/api"
import totalBalanceBackground from "data-base64:/assets/totalBalancebg.png"
import { Coins, DollarSign, LoaderCircle, X } from "lucide-react"
import Image from "next/image"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexBalanceDetails from "./balance-details"

interface IndexBalanceProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
}

interface PriceServiceData {
  currencies: Record<string, number>
  tokenPrices: Record<string, Record<string, number>>
}

const IndexBalance = ({ currentNetwork, currentWsAPI }: IndexBalanceProps) => {
  const { t } = useTranslation()

  const walletService = useMemo(() => new WalletService(), [])
  const balanceServices = useMemo(() => new BalanceServices(), [])
  const tokenService = useMemo(() => new TokenService(), [])

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [openWallets, setOpenWallets] = useState<boolean>(false)
  const [wallets, setWallets] = useState<WalletModel[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletModel | null>(null)
  const [balances, setBalances] = useState<BalanceModel[]>([])
  const [prices, setPrices] = useState<PriceServiceData | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState("$")

  const [tokenLogoMap, setTokenLogoMap] = useState<{ [key: string]: string }>({})
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true)
  const [loadingPerToken, setLoadingPerToken] = useState({})

  const [isTokenDetailDrawerOpen, setIsTokenDetailDrawerOpen] = useState<boolean>(false)
  const [selectedBalance, setSelectedBalance] = useState<BalanceModel | null>(null)

  useEffect(() => {
    setLoadingTokens(true)

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
    if (wsAPI !== null) {
      getWallets()
    }
  }, [wsAPI])

  const formatBalance = (value: number): string => {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const fixBalance = (value: string, decimal: number) => {
    const multiplier = 10 ** decimal
    return parseFloat(value) / multiplier
  }

  const formatCompactPrice = (
    value: number,
    threshold: number = 3
  ): string => {
    if (value === 0) return "0";
    if (value >= Math.pow(10, -threshold)) {
      return value.toString();
    }
  
    const str = value.toFixed(20);
    const [integer, fraction] = str.split('.');
    
    if (!fraction) return integer;
  
    const leadingZeros = fraction.match(/^0+/)?.[0]?.length || 0;
    const significantDigits = fraction.slice(leadingZeros).replace(/0+$/, '');
  
    return leadingZeros >= threshold
      ? `0.0{${leadingZeros}}${significantDigits}`
      : str.replace(/0+$/, '');
  };

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
              reservedBalance: balance.reservedBalance,
              isFrozen: balance.isFrozen,
              status: balance.isFrozen ? "Frozen" : balance.status
            }
          : prevBalance
      )
    )
  }
  const totalPortfolioValue = useMemo(() => {
    if (!prices) return 0

    return balances.reduce((total, balance) => {
      const tokenPrice = prices.tokenPrices[balance.token.symbol]?.[selectedCurrency] || 0

      const actualBalance = balance.freeBalance

      return total + actualBalance * tokenPrice
    }, 0)
  }, [balances, prices, selectedCurrency])

  const getBalances = async () => {
    try {
      const tokens = await tokenService.getTokens(network, wsAPI)
      await getTokenLogos(tokens)
      setLoadingTokens(false)

      let emptyBalances: BalanceModel[] = []

      if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i++) {
          setLoadingPerToken((prevLoadingPerToken) => ({
            ...prevLoadingPerToken,
            [tokens[i].symbol]: true
          }))

          let token = tokens[i]
          emptyBalances.push({
            owner: selectedWallet ? selectedWallet : null,
            token: token,
            freeBalance: 0,
            reservedBalance: 0,
            isFrozen: false,
            status: token.type === "Asset" ? "inactive" : "active"
          })
        }
      }

      setBalances(emptyBalances)

      const sortedEmptyBalances = [...emptyBalances].sort(
        (a, b) => a.token.id - b.token.id
      )

      sortedEmptyBalances.map(async (balance) => {
        if (balance.owner !== null) {
          try {
            const assetDetails = await wsAPI.query.assets.asset(balance.token.id)
            const parsedDetails = assetDetails.toHuman() as { status?: string } | null

            const isFrozen = parsedDetails?.status === "Frozen"

            balanceServices.getBalance(
              wsAPI,
              balance.token,
              balance.owner.public_key,
              (free, reserved) => {
                updateBalances({
                  ...balance,
                  freeBalance: fixBalance(free, balance.token.decimals),
                  reservedBalance: fixBalance(reserved, balance.token.decimals),
                  isFrozen: isFrozen,
                  status: isFrozen ? "Frozen" : balance.status
                })
              }
            )
          } catch (error) {
            console.error(
              `Error fetching asset status for ${balance.token.symbol}:`,
              error
            )
          }
        } else {
          updateBalances({
            ...balance,
            freeBalance: fixBalance("0", balance.token.decimals),
            reservedBalance: fixBalance("0", balance.token.decimals),
            isFrozen: false,
            status: "inactive"
          })
        }
      })
    } catch (error) {
      console.error("Error fetching balances:", error)
    }
  }

  useEffect(() => {
    const priceSocketService = new PriceService()

    priceSocketService.onPriceUpdate((data: PriceServiceData) => {
      setPrices(data)
    })

    return () => {
      priceSocketService.close()
    }
  }, [])

  useEffect(() => {
    if (selectedWallet !== null) {
      getBalances()
    }
  }, [selectedWallet])

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

  const selectBalance = (data: BalanceModel) => {
    if (data.status === "Frozen") {
      MessageBoxController.show("This asset was frozen and cannot be transferred.")
      return
    }

    setIsTokenDetailDrawerOpen(true)
    setSelectedBalance(data)
  }

  const handleTransferCompleteCallbacks = () => {
    setIsTokenDetailDrawerOpen(false)
    getBalances()
  }

  return (
    <>
      <div className="flex flex-col justify-between h-full gap-4 overflow-hidden">
        <div className="p-4 h-[150px] z-10 flex flex-col items-center justify-center">
          <div className="w-[300px] border-4 border-primary rounded-lg p-[2px] mb-2 bg-[#173f44]">
            <div className="w-full rounded p-[2px] bg-[#141a25] relative text-white">
              <img src={totalBalanceBackground} className="w-full" alt="Xterium Logo" />
              <span className="absolute top-1 left-2 text-xs">Total Amount</span>
              <span className="absolute top-5 left-6 text-xl w-full text-left font-bold">
                ${totalPortfolioValue.toFixed(3)}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-[#0ABBB5] p-4 w-[300px] mx-auto">
            <div className="px-2 py-1 rounded-sm bg-background border-2 border-[#3E7596]">
              {/* <Label className="text-primary text-[9px] mb-0">{t("Address")}</Label> */}
              <Popover open={openWallets} onOpenChange={setOpenWallets}>
                <PopoverTrigger asChild className="h-[20px]">
                  <Button
                    style={{ padding: "0px", background: "transparent", border: "none" }}
                    variant="roundedOutline"
                    role="combobox"
                    aria-expanded={openWallets}
                    className="w-full justify-between text-white p-3 hover:bg-accent"
                    size="lg">
                    {selectedWallet ? (
                      <>
                        <span className="text-white text-xs opacity-50">
                          {selectedWallet.name} &nbsp;
                          {"("}
                          {selectedWallet.public_key.slice(0, 6)}...
                          {selectedWallet.public_key.slice(-6)}
                          {")"}
                        </span>
                      </>
                    ) : (
                      <span className="text-white opacity-50 text-xs">
                        {t("Select wallet")}
                      </span>
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
                        {wallets.map((wallet) => (
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
          </div>
        </div>
        <div className="px-4 pt-16 md:pt-28 -mt-8 flex-1 max-h-[calc(100% - 150px)] bg-red-500 background-box overflow-hidden">
          {loadingTokens ? (
            <Loader />
          ) : (
            <>
              <h1 className="text-center text-xl mb-4">Balance</h1>
              {balances.length > 0 ? (
                <ScrollArea className="bg-background mr-0 md:mr-4 border dark:border-muted border-4 rounded p-2 h-[calc(100%-60px)]">
                  <>
                    {balances
                      .sort((a, b) => {
                        if (a.token.type === "Native" && b.token.type !== "Native")
                          return -1
                        if (a.token.type !== "Native" && b.token.type === "Native")
                          return 1
                        return 0
                      })
                      .map((balance, index) => {
                        const rawBalance = balance.freeBalance
                        const tokenPrice =
                          prices?.tokenPrices[balance.token.symbol]?.[selectedCurrency] ||
                          0
                        const formattedTokenPrice = `${selectedCurrency}${formatCompactPrice(tokenPrice)}`
                        const tokenValue = tokenPrice * rawBalance
                        const formattedTokenValue = `${selectedCurrency}${tokenValue.toFixed(3)}`

                        return (
                          <div key={index}>
                            <Card className="mb-1.5 border dark:border-muted bg-[#183F44] rounded-sm">
                              <Table>
                                <TableBody>
                                  <TableRow
                                    onClick={() => {
                                      if (
                                        !loadingPerToken[balance.token.symbol] &&
                                        balance.freeBalance !== 0
                                      ) {
                                        selectBalance(balance)
                                      }

                                      if (balance.freeBalance === 0) {
                                        MessageBoxController.show(
                                          "This token has zero balance available."
                                        )
                                      }
                                    }}
                                    className={`cursor-pointer hover-bg-custom ${
                                      loadingPerToken[balance.token.symbol]
                                        ? "cursor-not-allowed"
                                        : ""
                                    }`}>
                                    <TableCell className="w-[50px] justify-center">
                                      <Image
                                        src={
                                          tokenLogoMap[balance.token.symbol] ||
                                          "/assets/tokens/default.png"
                                        }
                                        width={40}
                                        height={40}
                                        alt={balance.token.symbol}
                                        className="ml-1"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="mb-[2px]">
                                        <span className="text-lg font-bold">
                                          {balance.token.symbol.length > 10
                                            ? balance.token.symbol.substring(0, 10) +
                                              "..."
                                            : balance.token.symbol}
                                        </span>
                                      </div>
                                      <span className="inline-block text-white text-sm font-bold rounded-full">
                                        {formattedTokenPrice}
                                      </span>
                                    </TableCell>
                                    <TableCell className="w-[50px] justify-end pr-2 text-right">
                                      <span className="text-lg font-bold text-purple">
                                        {loadingPerToken[balance.token.symbol] ? (
                                          <span className="text-sm text-white font-normal opacity-100">
                                            Loading...
                                          </span>
                                        ) : (
                                          formatBalance(balance.freeBalance)
                                        )}
                                      </span>
                                      <span className="inline-block text-white text-sm font-bold rounded-full">
                                        {formattedTokenValue}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Card>
                          </div>
                        )
                      })}
                  </>
                </ScrollArea>
              ) : (
                <div className="flex flex-col w-full items-center justify-center py-[100px] space-y-2">
                  <DollarSign className="size-20" />
                  <h4 className="font-bold text-lg">{t("Empty")}</h4>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer open={isTokenDetailDrawerOpen} onOpenChange={setIsTokenDetailDrawerOpen}>
        <DrawerContent className="border-0">
          <DrawerHeader>
            <div className="flex justify-center items-center w-full border-b border-border-1/20 pb-4 text-muted">
              {selectedBalance ? (
                <Image
                  src={
                    tokenLogoMap[selectedBalance.token.symbol] ||
                    "/assets/tokens/default.png"
                  }
                  alt={selectedBalance.token.symbol}
                  width={32}
                  height={32}
                  className="mr-2"
                />
              ) : (
                <div>{t("No Image")}</div>
              )}
              <DrawerTitle className="text-[#5d11a5]">
                {selectedBalance ? selectedBalance.token.symbol : ""}
              </DrawerTitle>
            </div>
          </DrawerHeader>
          <IndexBalanceDetails
            currentNetwork={network}
            currentWsAPI={wsAPI}
            selectedBalance={selectedBalance}
            handleTransferCompleteCallbacks={handleTransferCompleteCallbacks}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexBalance
