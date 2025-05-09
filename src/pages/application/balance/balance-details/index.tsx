import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import type { BalanceModel } from "@/models/balance.model"
import { NetworkModel } from "@/models/network.model"
import type { ApiPromise } from "@polkadot/api"
import type { ExtrinsicStatus } from "@polkadot/types/interfaces"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexTransferDetails from "./transfer-details"

interface IndexBalanceDetailsProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
  selectedBalance: BalanceModel | null
  handleTransferCompleteCallbacks: () => void
}

const IndexBalanceDetails = ({
  currentNetwork,
  currentWsAPI,
  selectedBalance,
  handleTransferCompleteCallbacks
}: IndexBalanceDetailsProps) => {
  const { t } = useTranslation()

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [balanceData, setBalanceData] = useState<BalanceModel | null>(null)
  const [isTransferDrawerOpen, setIsTransferDrawerOpen] = useState(false)

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

  useEffect(() => {
    if (selectedBalance !== null) {
      setBalanceData(selectedBalance)
    }
  }, [selectedBalance])

  const openTransferDrawer = () => {
    setIsTransferDrawerOpen(true)
  }

  const formatBalance = (value: number): string => {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleTransferStatusCallbacks = (status: ExtrinsicStatus) => {
    if (status.isInBlock) {
      setIsTransferDrawerOpen(false)
      handleTransferCompleteCallbacks()
    }
  }

  return (
    <>
      <Label className="tracking-[0.15em] font-semibold text-sm text-center">
        {t("Your Balance")}
      </Label>
      {balanceData && (
        <div className="flex flex-col items-center justify-center gap-2 w-full p-6">
          <div className="border-2 border-border w-full py-1 px-6 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
            <p className="text-lg font-bold text-purple">
              {formatBalance(balanceData.freeBalance + balanceData.reservedBalance)}
            </p>
            <Label className="text-xs font-semibold">{t("Total")}</Label>
          </div>
          <div className="border-2 border-border w-full py-1 px-6 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
            <p className="text-lg font-bold text-purple">
              {formatBalance(balanceData.freeBalance)}
            </p>
            <Label className="text-xs font-semibold">{t("Transferable")}</Label>
          </div>
          <div className="border-2 border-border w-full py-1 px-6 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
            <p className="text-lg font-bold text-purple">0.00</p>
            <Label className="text-xs font-semibold">{t("Locked")}</Label>
          </div>
        </div>
      )}
      <div className="p-6 pt-0">
        {balanceData && (
          <Button variant="jelly" type="button" onClick={openTransferDrawer}>
            {t("TRANSFER")}
          </Button>
        )}
      </div>

      <Drawer open={isTransferDrawerOpen} onOpenChange={setIsTransferDrawerOpen}>
        <DrawerContent className="border-0">
          <DrawerHeader>
            <DrawerTitle className="text-center text-purple">{t("TRANSFER")}</DrawerTitle>
          </DrawerHeader>
          <IndexTransferDetails
            currentNetwork={network}
            currentWsAPI={wsAPI}
            selectedBalance={selectedBalance}
            handleTransferStatusCallbacks={(status) => {
              handleTransferStatusCallbacks(status)
            }}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexBalanceDetails
