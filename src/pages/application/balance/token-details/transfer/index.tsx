import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { BalanceModel } from "@/models/balance.model"
import { BalanceServices } from "@/services/balance.service"
import { UserService } from "@/services/user.service"
import { Check, X } from "lucide-react"
import React, { useState } from "react"

const IndexTransfer = ({ selectedBalance, handleCallbacks }) => {
  const userService = new UserService()
  const balanceService = new BalanceServices()

  const [balanceData, setBalanceData] = useState<BalanceModel>(selectedBalance)

  const [quantity, setQuantity] = useState<number>(0)
  const [transferTo, setTransferTo] = useState<string>("")

  const [isSendInProgress, setIsSendInProgress] = useState<boolean>(false)
  const [sendLabel, setSendLabel] = useState<string>("SEND")

  const [partialFee, setPartialFee] = useState<number>(0)

  const [isInputPasswordDrawerOpen, setIsInputPasswordDrawerOpen] =
    useState<boolean>(false)
  const [inputedPassword, setInputedPassword] = useState<string>("")
  const [isTransferInProgress, setIsTransferInProgress] = useState<boolean>(false)
  const [confirmTransferLabel, setConfirmTransferLabel] = useState<string>("CONFIRM")

  const { toast } = useToast()

  const sendTransfer = () => {
    setIsSendInProgress(true)
    setSendLabel("CALCULATING FEES...")

    balanceService
      .getEstimateFee(
        balanceData.owner,
        parseFloat(fixBalanceReverse(quantity.toString(), 12)),
        transferTo,
        balanceData
      )
      .then((results) => {
        setIsInputPasswordDrawerOpen(true)

        setIsSendInProgress(false)
        setSendLabel("SEND")

        setPartialFee(fixBalance(results.partialFee, 12))
      })
  }

  const fixBalance = (value: string, decimal: number) => {
    const multiplier = 10 ** decimal
    return parseFloat(value) / multiplier
  }

  const fixBalanceReverse = (value: string, decimal: number): string => {
    const multiplier = 10 ** decimal
    return (parseFloat(value) * multiplier).toString()
  }

  const sendTransferWithPassword = () => {
    if (!inputedPassword.trim()) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            Password cannot be empty!
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    userService.login(inputedPassword).then((isValid) => {
      if (isValid == true) {
        setIsTransferInProgress(true)
        setConfirmTransferLabel("TRANSFER IN-PROGRESS...")

        if (balanceData.token.type == "Native") {
          balanceService
            .transfer(
              balanceData.owner,
              parseFloat(fixBalanceReverse(quantity.toString(), 12)),
              transferTo,
              inputedPassword
            )
            .then((results) => {
              console.log(results)
              if (results == true) {
                setIsInputPasswordDrawerOpen(false)

                toast({
                  description: (
                    <div className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Transfer Successful!
                    </div>
                  ),
                  variant: "default"
                })

                handleCallbacks()
              }
            })
        }

        if (balanceData.token.type == "Asset") {
          balanceService
            .transferAssets(
              balanceData.owner,
              balanceData.token.network_id,
              parseFloat(fixBalanceReverse(quantity.toString(), 12)),
              transferTo,
              inputedPassword
            )
            .then((results) => {
              console.log(results)
              if (results == true) {
                setIsInputPasswordDrawerOpen(false)

                toast({
                  description: (
                    <div className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Transfer Successful!
                    </div>
                  ),
                  variant: "default"
                })

                handleCallbacks()
              }
            })
        }
      } else {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              Invalid Password! Please try again.
            </div>
          ),
          variant: "destructive"
        })
      }
    })
  }

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
          type="number"
          className="mt-2 text-input-primary"
          placeholder="Enter amount"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value))}
        />
      </div>
      <div className="mt-4 px-4 font-bold">
        <Label htmlFor="transferTo">Transfer To:</Label>
        <Input
          id="transferTo"
          type="text"
          className="mt-2 text-input-primary"
          placeholder="Enter recipient address"
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
        />
      </div>
      <div className="p-6">
        <Button
          variant="jelly"
          className="w-full"
          type="button"
          onClick={sendTransfer}
          disabled={isSendInProgress}>
          {sendLabel}
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
              <Label className="font-bold pb-2">Partial Fee:</Label>
              <b className="text-lg">{partialFee}</b>
            </div>
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
              <Button
                type="button"
                variant="jelly"
                onClick={sendTransferWithPassword}
                disabled={isTransferInProgress}>
                {confirmTransferLabel}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexTransfer
