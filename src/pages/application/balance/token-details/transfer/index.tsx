import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { BalanceModel } from "@/models/balance.model"
import { BalanceServices } from "@/services/balance.service"
import { UserService } from "@/services/user.service"
import { Check, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const IndexTransfer = ({ selectedBalance, handleCallbacks }) => {
  const { t } = useTranslation()
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
  const [isTransferInProgress, setIsTransferInProgress] = useState<boolean>(false)
  const [confirmTransferLabel, setConfirmTransferLabel] = useState<string>("CONFIRM")

  const { toast } = useToast()

  const sendTransfer = () => {
    if (!quantity) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("Quantity cannot be empty!")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    if (quantity <= 0) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {"Quantity must be greater than zero!"}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    if (!transferTo.trim()) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("Recipient address cannot be empty!")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    setIsSendInProgress(true)
    setSendLabel(t("CALCULATING FEES..."))

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
        setSendLabel(t("SEND"))

        setPartialFee(fixBalance(results.partialFee, 12))
      })
  }

  useEffect(() => {
    setSendLabel(t("SEND"))
    setConfirmTransferLabel(t("CONFIRM"))
  }, [])

  const fixBalance = (value: string, decimal: number) => {
    const multiplier = 10 ** decimal
    return parseFloat(value) / multiplier
  }

  const fixBalanceReverse = (value: string, decimal: number): string => {
    const multiplier = 10 ** decimal
    return (parseFloat(value) * multiplier).toString()
  }

  const sendTransferWithPassword = () => {
    userService
      .getWalletPassword()
      .then((storedPassword) => {
        userService.login(storedPassword).then((isValid) => {
          if (isValid) {
            setIsTransferInProgress(true)
            setConfirmTransferLabel(t("TRANSFER IN-PROGRESS..."))

            if (balanceData.token.type == "Native") {
              balanceService
                .transfer(
                  balanceData.owner,
                  parseFloat(fixBalanceReverse(quantity.toString(), 12)),
                  transferTo,
                  storedPassword
                )
                .then((results) => {
                  console.log(results)
                  if (results) {
                    setIsInputPasswordDrawerOpen(false)

                    toast({
                      description: (
                        <div className="flex items-center">
                          <Check className="mr-2 text-green-500" />
                          {t("Transfer Successful!")}
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
                  storedPassword
                )
                .then((results) => {
                  console.log(results)
                  if (results) {
                    setIsInputPasswordDrawerOpen(false)

                    toast({
                      description: (
                        <div className="flex items-center">
                          <Check className="mr-2 text-green-500" />
                          {t("Transfer Successful!")}
                        </div>
                      ),
                      variant: "default"
                    })

                    handleCallbacks()
                  }
                })
            }
          }
        })
      })
      .catch((error) => {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              {t("Error retrieving password")}: {error}
            </div>
          ),
          variant: "destructive"
        })
      })
  }

  return (
    <>
      <div className="p-4 mt-5 rounded-md border border-2 table-border m-4">
        <Label className="pb-2">
          {t("Network")}:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.token.network || "N/A"}
          </span>
        </Label>
        <Label className="pb-2 flex items-center">
          {t("Owner")}:
          <span className="p-2 font-extrabold text-input-primary truncate max-w-full">
            {balanceData.owner || "N/A"}
          </span>
        </Label>
        <Label className="pb-2">
          {t("Symbol")}:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.token.symbol || "N/A"}
          </span>
        </Label>
        <Label className="pb-2">
          {t("Description")}:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.token.description || "N/A"}
          </span>
        </Label>
        <Label className="pb-2">
          {t("Current Balance")}:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.freeBalance || "0"}
          </span>
        </Label>
        <Label className="pb-2">
          {t("Reserve Balance")}:
          <span className="p-2 font-extrabold text-input-primary">
            {balanceData.reservedBalance || "0"}
          </span>
        </Label>
      </div>
      <div className="mt-4 px-4 font-bold">
        <Label htmlFor="quantity">{t("Quantity")}:</Label>
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
        <Label htmlFor="transferTo">{t("Transfer To")}:</Label>
        <Input
          id="transferTo"
          type="text"
          className="mt-2 text-input-primary"
          placeholder={t("Enter recipient address")}
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
        onOpenChange={setIsInputPasswordDrawerOpen}
        dismissible={!isTransferInProgress}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {t("SEND")}
              {balanceData.token.symbol}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="mb-8">
              <Label className="pb-2">
                {t("Fees of")}
                <span className="p-2 font-extrabold text-input-primary">
                  {partialFee.toString()} XON
                </span>
                {t("will be applied to the submission")}
              </Label>
              <hr className="mt-4 mb-4" />
              <Button
                variant="jelly"
                onClick={sendTransferWithPassword}
                className="w-full"
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
