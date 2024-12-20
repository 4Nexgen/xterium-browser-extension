import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { WalletService } from "@/services/wallet.service"
import { Check } from "lucide-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

const IndexDeleteWallet = ({ selectedWallet, handleCallbacks }) => {
  const { t } = useTranslation()
  const [walletData, setWalletData] = useState<WalletModel>(selectedWallet)

  const { toast } = useToast()

  const deleteWallet = () => {
    let walletService = new WalletService()
    walletService.deleteWallet(walletData.id).then((result) => {
      if (result != null) {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              Wallet Deleted Successfully!
            </div>
          ),
          variant: "default"
        })
      }
    })

    handleCallbacks()
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base">
            {t("Are you sure you want to delete")} <br />
            <span className="text-lg font-bold text-[#B375DC]">
              {walletData.name}
            </span>{" "}
            {t("from your wallet list?")}
          </Label>
        </div>
        <div className="flex flex-row space-x-3">
          <Button type="button" variant="jellyDestructive" onClick={deleteWallet}>
            {t("DELETE")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexDeleteWallet
