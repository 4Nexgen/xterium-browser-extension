import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import type { BalanceModel } from "@/models/balance.model"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

import IndexTransfer from "./transfer"

const IndexTokenDetails = ({ selectedBalance, handleCallbacks }) => {
  const { t } = useTranslation()
  const [balanceData, setBalanceData] = useState<BalanceModel>(selectedBalance)
  const [isTransferDrawerOpen, setIsTransferDrawerOpen] = useState(false)

  const openTransferDrawer = () => {
    setIsTransferDrawerOpen(true)
  }

  const formatBalance = (balance: string) => {
    const parsedBalance = parseFloat(balance)
    return isNaN(parsedBalance) ? "0.00" : parsedBalance.toFixed(2)
  }

  const transferComplete = () => {
    setIsTransferDrawerOpen(false)
    handleCallbacks()
  }

  return (
    <>
      <Label className="tracking-[0.15em] font-semibold text-sm text-center">
        {t("Your Balance")}
      </Label>
      <Table className="w-full">
        <TableBody>
          <TableRow className="flex flex-col gap-4 hover:bg-transparent hover:cursor-default p-6">
            <TableCell className="w-full h-12 flex items-center justify-center text-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-border dark:bg-muted/50">
              <div className="text-center">
                <p className="text-lg font-bold text-purple"> 
                  {formatBalance(
                    (balanceData.freeBalance + balanceData.reservedBalance).toString()
                  )}
                </p>
                <Label className="text-xs font-semibold">{t("Total")}</Label>
              </div>
            </TableCell>
            <TableCell className="w-full h-12 flex items-center justify-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-border dark:bg-muted/50">
              <div className="text-center">
                <p className="text-lg font-bold text-purple"> 
                  {formatBalance(balanceData.freeBalance.toString())}
                </p>
                <Label className="text-xs font-semibold">{t("Transferable")}</Label>
              </div>
            </TableCell>
            <TableCell className="w-full h-12 flex items-center justify-center bg-tablecell-detail rounded-xl relative border-2 border-primary dark:border-border dark:bg-muted/50">
              <div className="text-center">
                <p className="text-lg font-bold text-purple"> 
                  0.00
                </p>
                <Label className="text-xs font-semibold">{t("Locked")}</Label>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="p-6 pt-0">
        <Button variant="jelly" type="button" onClick={openTransferDrawer}>
          {t("TRANSFER")}
        </Button>
      </div>

      <Drawer open={isTransferDrawerOpen} onOpenChange={setIsTransferDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center text-purple">{t("TRANSFER")}</DrawerTitle>
          </DrawerHeader>
          <IndexTransfer
            selectedBalance={selectedBalance}
            handleCallbacks={transferComplete}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexTokenDetails