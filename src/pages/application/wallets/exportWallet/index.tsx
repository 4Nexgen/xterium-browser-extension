import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { UserService } from "@/services/user.service"
import { WalletService } from "@/services/wallet.service"
import { X } from "lucide-react"
import React, { useState } from "react"
import CryptoJS from "crypto-js"

const IndexExportWallet = ({ selectedWallet, handleCallbacks }) => {
  const userService = new UserService()

  const [walletData] = useState<WalletModel>(selectedWallet)

  const { toast } = useToast()

  const decryptData = (encryptedData, password) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, password).toString(CryptoJS.enc.Utf8)
      if (!decrypted) throw new Error("Decryption failed")
      return decrypted
    } catch (error) {
      console.error("Decryption error:", error)
      return null
    }
  }

  const exportWallet = async () => {
    try {
      const walletPassword = await userService.getWalletPassword()
      if (!walletPassword) {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-white-500" />
              Unable to retrieve wallet password.
            </div>
          ),
          variant: "destructive",
        })
        return
      }

      let walletService = new WalletService()
      const result = await walletService.getWalletById(walletData.id)

      const decryptedMnemonic = decryptData(result.mnemonic_phrase, walletPassword)
      const decryptedSecretKey = decryptData(result.secret_key, walletPassword)

      if (!decryptedMnemonic || !decryptedSecretKey) {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-white-500" />
              Failed to decrypt wallet data.
            </div>
          ),
          variant: "destructive",
        })
        return
      }

      const exportedWalletData: WalletModel = {
        id: result.id,
        name: result.name,
        address_type: result.address_type,
        mnemonic_phrase: decryptedMnemonic,
        secret_key: decryptedSecretKey,
        public_key: result.public_key,
      }

      const jsonBlob = new Blob([JSON.stringify(exportedWalletData)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(jsonBlob)
      const a = document.createElement("a")

      a.href = url
      a.download = `${walletData.name}_wallet.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      handleCallbacks()
    } catch (error) {
      console.error("Export wallet error:", error)
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-white-500" />
            Something went wrong during export.
          </div>
        ),
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base">
            Are you sure you want to export <br />
            <span className="text-lg font-bold text-[#B375DC]">
              {walletData.name}
            </span>{" "}
            from your wallet list?
          </Label>
        </div>
        <div className="mt-3 mb-3">
          <Button type="button" variant="jelly" onClick={exportWallet}>
            EXPORT
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexExportWallet
