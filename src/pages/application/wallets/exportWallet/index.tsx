import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { UserService } from "@/services/user.service"
import { WalletService } from "@/services/wallet.service"
import { Eye, EyeOff, X } from "lucide-react"
import React, { useState } from "react"

const IndexExportWallet = ({ selectedWallet, handleCallbacks }) => {
  const userService = new UserService()

  const [walletData, setWalletData] = useState<WalletModel>(selectedWallet)
  const [inputedPassword, setInputedPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const { toast } = useToast()

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const exportWallet = () => {
    userService.login(inputedPassword).then((isValid) => {
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
              <X className="mr-2 text-white-500" />
              Invalid Password!
            </div>
          ),
          variant: "destructive"
        })
      }
    })
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <Label className="font-bold pb-2">Enter your password:</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={inputedPassword}
              onChange={(e) => setInputedPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-0 px-3 text-sm font-semibold">
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
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
