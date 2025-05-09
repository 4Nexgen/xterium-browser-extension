import Loader from "@/components/loader"
import MessageBox from "@/components/message-box"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageBoxController } from "@/controllers/message-box-controller"
import { BalanceModel } from "@/models/balance.model"
import { NetworkModel } from "@/models/network.model"
import { TokenModel } from "@/models/token.model"
import { BalanceServices } from "@/services/balance.service"
import { EncryptionService } from "@/services/encryption.service"
import { TokenService } from "@/services/token.service"
import { UserService } from "@/services/user.service"
import { WalletService } from "@/services/wallet.service"
import { ApiPromise, Keyring } from "@polkadot/api"
import type { ExtrinsicStatus, RuntimeDispatchInfo } from "@polkadot/types/interfaces"
import { Copy } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexTransferDetailsProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
  selectedBalance: BalanceModel | null
  handleTransferStatusCallbacks: (status: ExtrinsicStatus) => void
}

const IndexTransferDetails = ({
  currentNetwork,
  currentWsAPI,
  selectedBalance,
  handleTransferStatusCallbacks
}: IndexTransferDetailsProps) => {
  const { t } = useTranslation()

  const userService = useMemo(() => new UserService(), [])
  const tokenService = useMemo(() => new TokenService(), [])
  const balanceServices = useMemo(() => new BalanceServices(), [])
  const encryptionService = useMemo(() => new EncryptionService(), [])
  const walletService = useMemo(() => new WalletService(), [])

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [balanceData, setBalanceData] = useState<BalanceModel | null>(null)

  const [nativeToken, setNativeToken] = useState<TokenModel | null>(null)

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

  const [userPassword, setUserPassword] = useState<string>("")
  const [isUserPasswordOpen, setIsUserPasswordOpen] = useState<boolean>(false)

  const [isProcessing, setIsProcessing] = useState(false)

  const [isTxSuccessDrawerOpen, setIsTxSuccessDrawerOpen] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [blockHash, setBlockHash] = useState<string | null>(null)


  useEffect(() => {
    setSendLabel(t("SEND"))
    setConfirmTransferLabel(t("CONFIRM"))

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

  const fixBalance = (value: string, decimal: number) => {
    const multiplier = 10 ** decimal
    return parseFloat(value) / multiplier
  }

  const formatBalance = (balance: number): string => {
    const str = balance.toString()
    const [integerPart, decimalPart] = str.split(".")

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    if (!decimalPart) {
      return `${formattedInteger}.00`
    } else {
      const trimmedDecimal = decimalPart.replace(/0+$/, "")
      if (trimmedDecimal === "") {
        return `${formattedInteger}.00`
      }
      return `${formattedInteger}.${trimmedDecimal}`
    }
  }

  const sendTransfer = async () => {
    if (!quantity || quantity <= 0) {
      MessageBoxController.show(
        `${t("Quantity must be greater than zero and cannot be empty!")}`
      )
      return
    }

    if (!transferTo.trim()) {
      MessageBoxController.show(`${t("Recipient address cannot be empty!")}`)
      return
    }

    if (transferTo.trim() === balanceData.owner.public_key) {
      MessageBoxController.show(
        `${t("Sender and recipient addresses must be different!")}`
      )
      return
    }

    setIsSendInProgress(true)
    setSendLabel(t("CALCULATING FEES..."))

    const nativeToken = await tokenService.getToken(network, wsAPI, 0)
    setNativeToken(nativeToken)

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

    if (balanceData.token.type === "Native") {
      if (quantity + estimatedFee > balanceData.freeBalance) {
        MessageBoxController.show("Not enough balance.")

        setIsSendInProgress(false)
        setSendLabel(t("SEND"))

        return
      }
    }

    if (balanceData.token.type === "Asset") {
      const nativeToken = await tokenService.getToken(network, wsAPI, 0)
      if (nativeToken) {
        const { free: ownerFreeBalance, reserved: ownerReservedBalance } =
          await balanceServices.getBalanceWithoutCallback(
            wsAPI,
            nativeToken,
            balanceData.owner.public_key
          )

        if (
          quantity > balanceData.freeBalance ||
          estimatedFee > fixBalance(ownerFreeBalance, 12)
        ) {
          MessageBoxController.show("Not enough balance.")

          setIsSendInProgress(false)
          setSendLabel(t("SEND"))

          return
        }

        const { free: recipientFreeBalance, reserved: recipientReservedBalance } =
          await balanceServices.getBalanceWithoutCallback(wsAPI, nativeToken, recipient)

        if (fixBalance(recipientFreeBalance, 12) <= 0) {
          MessageBoxController.show("The recipient does not have an existential balance.")

          setIsSendInProgress(false)
          setSendLabel(t("SEND"))

          return
        }
      }
    }

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
        (extrinsicResults, txHash, blockHash) => {
          if (extrinsicResults.isInBlock) {
            MessageBoxController.show("Transfer Successful!")
      
            setTxHash(txHash || null)
            setBlockHash(blockHash || null)
            setIsTxSuccessDrawerOpen(true)
      
            setIsProcessing(false)
            setIsUserPasswordOpen(false)
          } else if (extrinsicResults.isError) {
            MessageBoxController.show(
              `${t("Error: ")}: ${extrinsicResults.dispatchError.toString()}`
            )
          }
          
          setTimeout(() => {
            handleTransferStatusCallbacks(extrinsicResults.status)
          }, 10000) 
        }
      )          
    } else {
      MessageBoxController.show("Incorrect password!")

      setIsProcessing(false)
    }
  }

  return (
    <>
      {isSendInProgress && <Loader />}
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
                {formatBalance(balanceData.freeBalance || 0)}
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
            <DrawerContent className="border-0">
              <MessageBox />
              <DrawerHeader>
                <DrawerTitle>{t("Estimated Fees")}</DrawerTitle>
              </DrawerHeader>
              <div className="p-6">
                <div className="mb-8">
                  <Label className="pb-2">
                    {t("Fees of")}
                    <span className="p-2 font-extrabold text-input-primary">
                      {estimatedFee.toFixed(12)} {nativeToken?.symbol || "XON"}
                    </span>
                    {t("will be applied to the submission")}
                  </Label>
                  <hr className="mt-4 mb-4" />
                  <Button variant="jelly" onClick={transfer} className="w-full">
                    {t("PROCEED")}
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
        <DrawerContent className="border-0">
          <DrawerHeader>
            <DrawerTitle className="text-white border-b border-border-1/20 pb-4">
              {t("Confirm Transfer")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="py-2 px-6">
            <p className="text-center mb-2">{t("Enter your password:")}</p>
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
                {isProcessing ? t("CONFIRMING...") : t("CONFIRM")}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={isTxSuccessDrawerOpen} onOpenChange={setIsTxSuccessDrawerOpen}>
        <DrawerContent className="border-0">
          <DrawerHeader>
            <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">
              {t("Transaction Submitted")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <Label className="block font-semibold text-muted-foreground text-sm mt-6">
              {t("Transaction Hash")}:
            </Label>
            <div className="relative mt-2 p-3 font-mono text-xs text-muted break-words bg-background rounded-lg max-w-full overflow-hidden pr-10 border border-border">
              {txHash && (
                <a
                  href={
                    network?.name === "Asset Hub - Paseo"
                      ? `https://assethub-paseo.subscan.io/extrinsic/${txHash}`
                      : network?.name === "Asset Hub - Polkadot"
                      ? `https://assethub-polkadot.subscan.io/extrinsic/${txHash}`
                      : network?.name === "Asset Hub - Kusama"
                      ? `https://assethub-kusama.subscan.io/extrinsic/${txHash}`
                      : network?.name === "Xode - Kusama"
                      ? `https://node.xode.net/transactions?search=${txHash}`
                      : network?.name === "Xode - Polkadot"
                      ? `https://node.xode.net/transactions?search=${txHash}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline break-all"
                >
                  {txHash}
                </a>
              )}
              <button
                onClick={() => txHash && navigator.clipboard.writeText(txHash)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition"
                type="button"
                aria-label="Copy Tx Hash"
              >
                <Copy size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 italic">
              {t("Will automatically close in 10 seconds.")}
            </p>

            {txHash && (
              <div className="mt-4">
                <Button variant="jelly" className="w-full" asChild>
                  <a
                    href={
                      network?.name === "Asset Hub - Paseo"
                        ? `https://assethub-paseo.subscan.io/extrinsic/${txHash}`
                        : network?.name === "Asset Hub - Polkadot"
                        ? `https://assethub-polkadot.subscan.io/extrinsic/${txHash}`
                        : network?.name === "Asset Hub - Kusama"
                        ? `https://assethub-kusama.subscan.io/extrinsic/${txHash}`
                        : network?.name === "Xode - Kusama"
                        ? `https://node.xode.net/transactions?search=${txHash}`
                        : network?.name === "Xode - Polkadot"
                        ? `https://node.xode.net/transactions?search=${txHash}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center"
                  >
                    {t("View in Scanner")}
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexTransferDetails
