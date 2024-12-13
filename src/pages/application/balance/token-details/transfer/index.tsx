import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BalanceModel } from "@/models/balance.model"
import React, { useState } from "react"

const IndexTransfer = ({ selectedBalance }) => {
  const [balanceData, setBalanceData] = useState<BalanceModel>(selectedBalance)
  const [isInputPasswordDrawerOpen, setIsInputPasswordDrawerOpen] =
    useState<boolean>(false)
  const [inputedPassword, setInputedPassword] = useState<string>("")

  const sendTransfer = () => {
    setIsInputPasswordDrawerOpen(true)
  }

  const sendTransferWithPassword = () => {}

  return (
    <>
      <div className="p-4 mt-5 rounded-md border border-2 table-border m-4">
        <Label className="pb-2">
          Network:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.token.network || "N/A"}
          </span>
        </Label>
        <Label className="pb-2">
          Owner:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.owner || "N/A"}
          </span>
        </Label>
        <Label className="pb-2">
          Symbol:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.token.symbol || "N/A"}
          </span>
        </Label>
        <Label className="pb-2">
          Description:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.token.description || "N/A"}
          </span>
        </Label>
        <Label className="pb-2">
          Current Balance:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.freeBalance || "0"}
          </span>
        </Label>
        <Label className="pb-2">
          Reserve Balance:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.reservedBalance || "0"}
          </span>
        </Label>
      </div>
      <div className="mt-4 px-4 font-bold">
        <Label htmlFor="quantity">Quantity:</Label>
        <Input
          id="quantity"
          type="text"
          className="mt-2 text-input-primary"
          placeholder="Enter amount"
        />
      </div>
      <div className="mt-4 px-4 font-bold">
        <Label htmlFor="transferTo">Transfer To:</Label>
        <Input
          id="transferTo"
          type="text"
          className="mt-2 text-input-primary"
          placeholder="Enter recipient address"
        />
      </div>
      <div className="p-6">
        <Button variant="jelly" className="w-full" type="button" onClick={sendTransfer}>
          SEND
        </Button>
      </div>

      <Drawer
        open={isInputPasswordDrawerOpen}
        onOpenChange={setIsInputPasswordDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>SEND {balanceData.token.symbol}</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="mb-8">
              <Label className="font-bold pb-2">Enter your password:</Label>
              <Input
                type="password"
                placeholder="********"
                value={inputedPassword}
                onChange={(e) => setInputedPassword(e.target.value)}
              />
            </div>
            <div className="mt-3 mb-3">
              <Button type="button" variant="jelly" onClick={sendTransferWithPassword}>
                CONFIRM
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexTransfer
