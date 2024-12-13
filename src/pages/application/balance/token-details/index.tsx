import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TokenImages } from "@/data/token.data"
import React, { useEffect, useState } from "react"

import IndexTransfer from "./transfer"

const IndexTokenDetails = ({ selectedBalance }) => {
  const [isTransferDrawerOpen, setIsTransferDrawerOpen] = useState(false)

  const openTransfer = () => {
    setIsTransferDrawerOpen(true)
  }

  const formatBalance = (balance: string) => {
    const parsedBalance = parseFloat(balance)
    return isNaN(parsedBalance) ? "0.00" : parsedBalance.toFixed(2)
  }

  return (
    <>
      <Label className="mt-4 tracking-[0.15em] font-semibold text-sm text-white text-center">
        Your Balance
      </Label>
      <Table className="mt-6 w-full">
        <TableBody>
          <TableRow className="flex justify-center gap-4">
            <TableCell className="w-24 h-24 flex items-center justify-center text-center bg-tablecell-detail rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-purple">
                  {formatBalance(selectedBalance.balance)}
                </p>
                <Label className="text-sm font-semibold">Total</Label>
              </div>
            </TableCell>
            <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-purple">
                  {formatBalance(selectedBalance.balance)}
                </p>
                <Label className="text-sm font-semibold">Transferable</Label>
              </div>
            </TableCell>
            <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-purple">0.00</p>
                <Label className="text-sm font-semibold">Locked</Label>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="p-6">
        <Button variant="violet" type="button" onClick={openTransfer}>
          TRANSFER
        </Button>
      </div>


      
    </>
  )
}

export default IndexTokenDetails
