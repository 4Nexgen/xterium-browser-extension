import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { BalanceModel } from "@/models/balance.model"
import { BalanceServices } from "@/services/balance.service"
import { EncryptionService } from "@/services/encryption.service"
import { UserService } from "@/services/user.service"
import { WalletService } from "@/services/wallet.service"
import { ApiPromise, Keyring } from "@polkadot/api"
import type { ExtrinsicStatus, RuntimeDispatchInfo } from "@polkadot/types/interfaces"
import { Check, X } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexTransferDetailsProps {
  currentWsAPI: ApiPromise | null
  selectedBalance: BalanceModel | null
  handleTransferStatusCallbacks: (status: ExtrinsicStatus) => void
}

const IndexTransferDetails = ({
  currentWsAPI,
  selectedBalance,
  handleTransferStatusCallbacks
}: IndexTransferDetailsProps) => {
  const { t } = useTranslation()

  const userService = useMemo(() => new UserService(), [])
  const balanceServices = useMemo(() => new BalanceServices(), [])
  const encryptionService = useMemo(() => new EncryptionService(), [])
  const walletService = useMemo(() => new WalletService(), [])

  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [balanceData, setBalanceData] = useState<BalanceModel | null>(null)

  const [quantity, setQuantity] = useState<number>(0)
  const [transferTo, setTransferTo] = useState<string>("")
  const [sendLabel, setSendLabel] = useState<string>("SEND")
  const [isSendInProgress, setIsSendInProgress] = useState<boolean>(false)

  const [estimatedFee, setEstimatedFee] = useState<number>(0)
  const [isEstimatedFeesDrawerOpen, setIsEstimatedFeesDrawerOpen] =
    useState<boolean>(false)
  const [confirmTransferLabel, setConfirmTransferLabel] = useState<string>("CONFIRM")
  const [isConfirmTransferInProgress, setIsConfirmTransferInProgress] =
    useState<boolean>(false)

  const { toast } = useToast()

  const [userPassword, setUserPassword] = useState<string>("")
  const [isUserPasswordOpen, setIsUserPasswordOpen] = useState<boolean>(false)

  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (currentWsAPI) {
      setWsAPI(currentWsAPI)
    }

    setSendLabel(t("SEND"))
    setConfirmTransferLabel(t("CONFIRM"))
  }, [currentWsAPI])

  useEffect(() => {
    if (selectedBalance !== null) {
      setBalanceData(selectedBalance)
    }
  }, [selectedBalance])

  const sendTransfer = async () => {
    if (!quantity || quantity <= 0) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("Quantity must be greater than zero and cannot be empty!")}
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

    if (transferTo.trim() === balanceData.owner.public_key) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("Sender and recipient addresses must be different!")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    setIsSendInProgress(true)
    setSendLabel(t("CALCULATING FEES..."))

    const owner = balanceData.owner
    const recipient = transferTo
    const amount = parseFloat(fixBalanceReverse(quantity.toString(), 12))
    const estimatedFee = await balanceServices.getEstimateTransferFee(
      wsAPI,
      balanceData.token,
      owner.public_key,
      recipient,
      amount
    )

    setEstimatedFee(estimatedFee)
    setIsEstimatedFeesDrawerOpen(true)

    setIsSendInProgress(false)
    setSendLabel(t("SEND"))
  }

  const fixBalanceReverse = (value: string, decimal: number): string => {
    return BigInt(Math.round(parseFloat(value) * Math.pow(10, decimal))).toString()
  }

  const transfer = () => {
    setIsUserPasswordOpen(true)
  }

  const handlePasswordChange = async (value: string) => {
    setUserPassword(value)
  }

  const confirmTransfer = async () => {
    setIsProcessing(true)

    const isLogin = await userService.login(userPassword)
    if (isLogin) {
      setIsConfirmTransferInProgress(true)
      setConfirmTransferLabel(t("TRANSFER IN-PROGRESS..."))

      const decryptedMnemonicPhrase = encryptionService.decrypt(
        userPassword,
        balanceData.owner.mnemonic_phrase
      )
      const keyring = new Keyring({ type: "sr25519" })
      const signature = keyring.addFromUri(decryptedMnemonicPhrase)

      const recipient = transferTo
      const amount = Number(fixBalanceReverse(quantity.toString(), 12))

      balanceServices.transfer(
        wsAPI,
        balanceData.token,
        signature,
        recipient,
        amount,
        (extrinsicResults) => {
          if (extrinsicResults.isInBlock) {
            toast({
              description: (
                <div className="flex items-center">
                  <Check className="mr-2 text-green-500" />
                  {t("Transfer Successful!")}
                </div>
              ),
              variant: "default"
            })

            setIsProcessing(false)
            setIsUserPasswordOpen(false)
          } else if (extrinsicResults.isError) {
            toast({
              description: (
                <div className="flex items-center">
                  <X className="mr-2 text-red-500" />
                  {t("Error: ")}: {extrinsicResults.dispatchError.toString()}
                </div>
              ),
              variant: "destructive"
            })
          }

          handleTransferStatusCallbacks(extrinsicResults.status)
        }
      )
    } else {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-white-500" />
            {t("Incorrect password!")}
          </div>
        ),
        variant: "destructive"
      })

      setIsProcessing(false)
    }
  }

  return (
    <>
      {balanceData !== null && (
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
                {balanceData.owner.public_key || "N/A"}
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
                {balanceData.token.name || "N/A"}
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
            open={isEstimatedFeesDrawerOpen}
            onOpenChange={setIsEstimatedFeesDrawerOpen}
            dismissible={!isConfirmTransferInProgress}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {t("SEND ")}
                  {balanceData.token.symbol}
                </DrawerTitle>
              </DrawerHeader>
              <div className="p-6">
                <div className="mb-8">
                  <Label className="pb-2">
                    {t("Fees of")}
                    <span className="p-2 font-extrabold text-input-primary">
                      {estimatedFee.toFixed(12)} XON
                    </span>
                    {t("will be applied to the submission")}
                  </Label>
                  <hr className="mt-4 mb-4" />
                  <Button variant="jelly" onClick={transfer} className="w-full">
                    {t("TRANSFER")}
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}

      <Drawer
        open={isUserPasswordOpen}
        onOpenChange={setIsUserPasswordOpen}
        dismissible={userPassword === ""}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">
              {t("ENTER YOUR PASSWORD")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="mb-3">
              <Input
                type="password"
                placeholder={t("Type your password")}
                value={userPassword}
                disabled={isProcessing}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <p className="font-inter text-[11px] p-0 font-base text-justify text-white opacity-50">
                {t("To confirm your transactions, please enter your password.")}
              </p>
            </div>
            <div className="mt-5 mb-3">
              <Button
                type="button"
                variant="jelly"
                onClick={confirmTransfer}
                disabled={userPassword === "" || isProcessing}>
                {t("CONFIRM")}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexTransferDetails
