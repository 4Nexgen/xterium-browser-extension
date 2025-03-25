import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { BalanceModel } from "@/models/balance.model"
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

    if (transferTo.trim() === balanceData.owner) {
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
    let dispatchInfo: RuntimeDispatchInfo = null

    if (balanceData.token.type == "Native") {
      dispatchInfo = await wsAPI.tx.balances
        .transfer(recipient, amount)
        .paymentInfo(owner)
    }

    if (balanceData.token.type == "Asset") {
      const assetId = balanceData.token.network_id
      dispatchInfo = await wsAPI.tx.assets
        .transfer(assetId, recipient, amount)
        .paymentInfo(owner)
    }

    if (dispatchInfo !== null) {
      const rawFee = BigInt(dispatchInfo.partialFee.toString())
      const formattedFee = Number(rawFee) / Math.pow(10, 12)
      setEstimatedFee(formattedFee)
    }

    setIsEstimatedFeesDrawerOpen(true)

    setIsSendInProgress(false)
    setSendLabel(t("SEND"))
  }

  const fixBalanceReverse = (value: string, decimal: number): string => {
    return BigInt(Math.round(parseFloat(value) * Math.pow(10, decimal))).toString()
  }

  const confirmTransfer = async () => {
    const password = await userService.getWalletPassword()
    if (password) {
      const isLogin = await userService.login(password)
      if (isLogin == true) {
        setIsConfirmTransferInProgress(true)
        setConfirmTransferLabel(t("TRANSFER IN-PROGRESS..."))

        const wallets = await walletService.getWallets()
        const walletOwner = wallets.filter((d) => d.public_key === balanceData.owner)[0]

        const decryptedMnemonicPhrase = encryptionService.decrypt(
          password,
          walletOwner.mnemonic_phrase
        )
        const keyring = new Keyring({ type: "sr25519" })
        const signature = keyring.addFromUri(decryptedMnemonicPhrase)

        const recipient = transferTo
        const amount = Number(fixBalanceReverse(quantity.toString(), 12))

        if (balanceData.token.type == "Native") {
          wsAPI.tx.balances
            .transferAllowDeath(recipient, amount)
            .signAndSend(signature, (result) => {
              console.log(result.status)

              handleTransferStatusCallbacks(result.status)

              if (result.status.isInBlock) {
                toast({
                  description: (
                    <div className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      {t("Transfer Successful!")}
                    </div>
                  ),
                  variant: "default"
                })
              } else if (result.isError) {
                toast({
                  description: (
                    <div className="flex items-center">
                      <X className="mr-2 text-red-500" />
                      {t("Error: ")}: {result.dispatchError.toString()}
                    </div>
                  ),
                  variant: "destructive"
                })
              }
            })
        }

        if (balanceData.token.type == "Asset") {
          const assetId = balanceData.token.network_id
          const formattedAmount = wsAPI.createType("Compact<u128>", amount)

          wsAPI.tx.assets
            .transfer(assetId, recipient, formattedAmount)
            .signAndSend(signature, (result) => {
              handleTransferStatusCallbacks(result.status)

              if (result.status.isInBlock) {
                toast({
                  description: (
                    <div className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      {t("Transfer Successful!")}
                    </div>
                  ),
                  variant: "default"
                })
              } else if (result.isError) {
                toast({
                  description: (
                    <div className="flex items-center">
                      <X className="mr-2 text-red-500" />
                      {t("Error: ")}: {result.dispatchError.toString()}
                    </div>
                  ),
                  variant: "destructive"
                })
              }
            })
        }
      } else {
        // navigate to login
      }
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
                  <Button
                    variant="jelly"
                    onClick={confirmTransfer}
                    className="w-full"
                    disabled={isConfirmTransferInProgress}>
                    {confirmTransferLabel}
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  )
}

export default IndexTransferDetails
