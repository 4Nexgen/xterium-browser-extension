import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { WalletService } from "@/services/wallet.service"
import { Check, X } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexExportWalletProps {
  selectedWallet: WalletModel
}

const IndexExportWallet = ({ selectedWallet }: IndexExportWalletProps) => {
  const { t } = useTranslation()

  const { toast } = useToast()

  const walletService = useMemo(() => new WalletService(), [])
  const [wallet, setWallet] = useState<WalletModel | null>(null)

  useEffect(() => {
    if (selectedWallet) {
      setWallet(selectedWallet)
    }
  }, [selectedWallet])

  const exportWallet = async () => {
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

      toast({
        description: (
          <div className="flex items-center">
            <Check className="mr-2 text-green-500" />
            {t("Wallet Exported Successfully!")}
          </div>
        ),
        variant: "default"
      })
    }
  }

  return (
    <>
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
    </>
  )
}

export default IndexExportWallet
