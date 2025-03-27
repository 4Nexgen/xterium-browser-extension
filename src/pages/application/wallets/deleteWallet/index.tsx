import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { UserService } from "@/services/user.service"
import { WalletService } from "@/services/wallet.service"
import { Check, X } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexDeleteWalletProps {
  selectedWallet: WalletModel
  handleCallbackDataUpdates: () => void
}

const IndexDeleteWallet = ({
  selectedWallet,
  handleCallbackDataUpdates
}: IndexDeleteWalletProps) => {
  const { t } = useTranslation()

  const { toast } = useToast()

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

  const deleteWallet = () => {
    setIsUserPasswordOpen(true)
  }

  const confirmDelete = async () => {
    setIsProcessing(true)

    const isLogin = await userService.login(userPassword)
    if (isLogin) {
      const deleteWallet = await walletService.deleteWallet(wallet.public_key)
      if (deleteWallet) {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              {t("Wallet Deleted Successfully!")}
            </div>
          ),
          variant: "default"
        })

        setIsProcessing(false)
        setIsUserPasswordOpen(false)

        handleCallbackDataUpdates()
      }
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
      {wallet && (
        <div className="p-6">
          <div className="mb-8">
            <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base">
              {t("Are you sure you want to delete")} <br />
              <span className="text-lg font-bold text-[#B375DC]">{wallet.name}</span>{" "}
              {t("from your wallet list?")}
            </Label>
          </div>
          <div className="flex flex-row space-x-3">
            <Button type="button" variant="jellyDestructive" onClick={deleteWallet}>
              {t("DELETE")}
            </Button>
          </div>
        </div>
      )}

      <Drawer open={isUserPasswordOpen} onOpenChange={setIsUserPasswordOpen}>
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
                onClick={confirmDelete}
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

export default IndexDeleteWallet
