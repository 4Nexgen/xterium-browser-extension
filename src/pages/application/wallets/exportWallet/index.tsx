import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { LoginService } from "@/services/login.service"
import { WalletService } from "@/services/wallet.service"
import { Check } from "lucide-react"
import React, { useState } from "react"

const IndexExportWallet = ({ selectedWallet, handleCallbacks }) => {
  const [walletData, setWalletData] = useState<WalletModel>(selectedWallet)
  const [inputedPassword, setInputedPassword] = useState<string>("")

  const { toast } = useToast()

  const exportWallet = () => {
    let loginService = new LoginService()
    loginService.login(inputedPassword).then((isValid) => {
      if (isValid == true) {
        let walletService = new WalletService()
        walletService.getWalletById(walletData.id).then((result) => {
          const exportedWalletData: WalletModel = {
            id: result.id,
            name: result.name,
            address_type: result.address_type,
            mnemonic_phrase: result.mnemonic_phrase,
            secret_key: result.secret_key,
            public_key: result.public_key
          }

          const jsonBlob = new Blob([JSON.stringify(exportedWalletData)], {
            type: "application/json"
          })
          const url = URL.createObjectURL(jsonBlob)
          const a = document.createElement("a")

          a.href = url
          a.download = `${walletData.name}_wallet.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          handleCallbacks()
        })
      } else {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              Invalid Password!
            </div>
          ),
          variant: "default"
        })
      }
    })
  }

  return (
    <>
      <div className="p-6">
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
          <Button type="button" variant="violet" onClick={exportWallet}>
            EXPORT
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexExportWallet
