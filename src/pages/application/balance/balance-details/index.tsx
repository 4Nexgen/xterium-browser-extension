import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
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

  const formatBalance = (balance: string) => {
    const parsedBalance = parseFloat(balance)
    return isNaN(parsedBalance) ? "0.00" : parsedBalance.toFixed(2)
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
        <Table className="w-full">
          <TableBody>
            <TableRow className="flex flex-col gap-4 hover:bg-transparent hover:cursor-default p-6">
              <TableCell className="w-full h-12 flex items-center justify-center text-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-[#16514d] dark:border-border dark:bg-muted/50">
                <div className="text-center">
                  <p className="text-lg font-bold text-purple">
                    {formatBalance(
                      (balanceData.freeBalance + balanceData.reservedBalance).toString()
                    )}
                  </p>
                  <Label className="text-xs font-semibold">{t("Total")}</Label>
                </div>
              </TableCell>
              <TableCell className="w-full h-12 flex items-center justify-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-[#16514d] dark:border-border dark:bg-muted/50">
                <div className="text-center">
                  <p className="text-lg font-bold text-purple">
                    {formatBalance(balanceData.freeBalance.toString())}
                  </p>
                  <Label className="text-xs font-semibold">{t("Transferable")}</Label>
                </div>
              </TableCell>
              <TableCell className="w-full h-12 flex items-center justify-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-[#16514d] dark:border-border dark:bg-muted/50">
                <div className="text-center">
                  <p className="text-lg font-bold text-purple">0.00</p>
                  <Label className="text-xs font-semibold">{t("Locked")}</Label>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
