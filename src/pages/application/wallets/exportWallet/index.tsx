import MessageBox from "@/components/message-box"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageBoxController } from "@/controllers/message-box-controller"
import type { WalletModel } from "@/models/wallet.model"
import { UserService } from "@/services/user.service"
import { WalletService } from "@/services/wallet.service"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexExportWalletProps {
  selectedWallet: WalletModel
  handleCallbackDataUpdates: () => void
}

const IndexExportWallet = ({ selectedWallet, handleCallbackDataUpdates }: IndexExportWalletProps) => {
  const { t } = useTranslation()

  const walletService = useMemo(() => new WalletService(), [])
  const userService = useMemo(() => new UserService(), [])
  
  const [wallet, setWallet] = useState<WalletModel | null>(null)

  const [userPassword, setUserPassword] = useState<string>("")
  const [isUserPasswordOpen, setIsUserPasswordOpen] = useState<boolean>(false)

  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (selectedWallet) {
      setWallet(selectedWallet)
    }
  }, [selectedWallet])

  const handlePasswordChange = async (value: string) => {
    setUserPassword(value)
  }

  const exportWallet = () => {
    setIsUserPasswordOpen(true)
  }

  const confirmExport = async () => {
    setIsProcessing(true)

    const isLogin = await userService.login(userPassword)
    if (isLogin) {
      const result = await walletService.getWallet(wallet.public_key)
      if (result !== null) {
        const exportedWalletData: WalletModel = {
          id: result.id,
          name: result.name,
          address_type: result.address_type,
          mnemonic_phrase: result.mnemonic_phrase,
          secret_key: result.secret_key,
          public_key: result.public_key,
          type: result.type
        }

        const jsonBlob = new Blob([JSON.stringify(exportedWalletData)], {
          type: "application/json"
        })
        const url = URL.createObjectURL(jsonBlob)
        const a = document.createElement("a")

        a.href = url
        a.download = `${wallet.name}_wallet.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // MessageBoxController.show(`${t("Wallet Exported Successfully!")}`)

        setIsProcessing(false)
        setIsUserPasswordOpen(false)

        handleCallbackDataUpdates()
      }
    } else {
      MessageBoxController.show(`${t("Incorrect password!")}`)

      setIsProcessing(false)
    }
  }

  return (
    <>
      <MessageBox />
      {wallet && (
        <div className="p-6">
          <div className="mb-8">
            <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base">
              {t("Are you sure you want to export")} <br />
              <span className="text-lg font-bold text-[#B375DC]">{wallet.name}</span>{" "}
              {t("from your wallet list?")}
            </Label>
          </div>
          <div className="mt-3 mb-3">
            <Button type="button" variant="jelly" onClick={exportWallet}>
              {t("EXPORT")}
            </Button>
          </div>
        </div>
      )}

      <Drawer open={isUserPasswordOpen} onOpenChange={setIsUserPasswordOpen}>
        <DrawerContent className="border-0">
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
                onClick={confirmExport}
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

export default IndexExportWallet
