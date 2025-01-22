import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexSwapPumpToken from "./swapPumpToken"

const IndexPumpTokenDetails = ({ selectedPumpTokens, owner, handleCallbacks }) => {
  const { t } = useTranslation()
  const [isSwapPumpDrawerOpen, setIsSwapPumpDrawerOpen] = useState(false)

  if (!selectedPumpTokens) {
    return <div>{t("Loading...")}</div>
  }

  const { description, price, marketCap, virtualLiquidity, volume24h, tokenCreated } =
    selectedPumpTokens

  const formatCurrency = (amount) => {
    if (!amount) return "$0.0"
    const num = parseFloat(amount.replace(/,/g, ""))
    if (isNaN(num)) return "$0.0"

    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}k`
    }
    return `$${num.toFixed(1)}`
  }

  const [timeElapsed, setTimeElapsed] = useState("")

  const calculateTimeElapsed = () => {
    const now = new Date()
    const createdTime = new Date(tokenCreated)

    if (isNaN(createdTime.getTime())) {
      console.error("Invalid tokenCreated date:", tokenCreated)
      return
    }

    const elapsed = Math.floor((now.getTime() - createdTime.getTime()) / 1000)

    const days = Math.floor(elapsed / 86400)
    const hours = Math.floor((elapsed % 86400) / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)

    let timeString = ""

    if (days > 0) {
      timeString += `${days}D `
      timeString += `${hours}H `
      timeString += `${minutes}M`
    } else if (hours > 0) {
      timeString += `${hours}H `
      timeString += `${minutes}M`
    } else {
      timeString += `${minutes}M`
    }

    setTimeElapsed(timeString.trim() || "0M")
  }

  useEffect(() => {
    calculateTimeElapsed()

    const intervalId = setInterval(calculateTimeElapsed, 1000)

    return () => clearInterval(intervalId)
  }, [tokenCreated])

  const swapPumpToken = () => {
    setIsSwapPumpDrawerOpen(true)
  }

  return (
    <div className="p-4">
      <div className="w-full flex justify-center mb-4">
        <img
          src={selectedPumpTokens.image_url}
          className="h-20 w-full object-cover object-center rounded-lg"
        />
      </div>
      <div className="flex">
        <div>
          <img
            src={selectedPumpTokens.image_url}
            alt={selectedPumpTokens.name}
            className="rounded-full object-cover h-20 w-20"
          />
        </div>
        <div className="ml-6 w-3/4">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-2">
              <p>
                Created by:{" "}
                <span className="font-semibold">
                  {owner ? `${owner.slice(0, 4)}...${owner.slice(-4)}` : "N/A"}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-x-2">
            <p className="font-semibold">{t("Contract: ")}</p>
            <p className="opacity-70 text-muted">{selectedPumpTokens.assetId}</p>
          </div>
          <div className="mt-2">
            <p className="opacity-70">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <div className="flex items-center">
            <p className="font-semibold text-sm opacity-70 mr-2">{t("Price")}</p>
            <p className="text-muted">+12.29%</p>
          </div>
          <p className="font-bold text-sm">{price} XON</p>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Market Cap")}</p>
          <p className="font-bold text-sm">{formatCurrency(marketCap)}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Virtual Liquidity")}</p>
          <p className="font-bold text-sm">{formatCurrency(virtualLiquidity)}</p>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("24H Volume")}</p>
          <p className="font-bold text-sm">{volume24h} XON</p>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Token Created")}</p>
          <p className="font-bold text-sm">{timeElapsed}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="jelly" onClick={swapPumpToken}>
          {t("SWAP TO XON")}
        </Button>
      </div>
      <Drawer open={isSwapPumpDrawerOpen} onOpenChange={setIsSwapPumpDrawerOpen}>
        <DrawerContent>
          {/* <DrawerHeader>
            <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
              {t("SWAP PUMP TOKEN")}
            </DrawerTitle>
          </DrawerHeader> */}
          <IndexSwapPumpToken handleCallbacks={handleCallbacks} />
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default IndexPumpTokenDetails
