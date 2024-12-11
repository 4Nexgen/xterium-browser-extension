import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { WalletService } from "@/services/wallet.service"
import { Check } from "lucide-react"
import React, { useState } from "react"

const IndexAddWallet = ({ handleCallbacks }) => {
  const [isInputPasswordDrawerOpen, setIsInputPasswordDrawerOpen] =
    useState<boolean>(false)
  const [walletData, setWalletData] = useState<WalletModel>({
    id: 0,
    name: "",
    address_type: "",
    mnemonic_phrase: "",
    secret_key: "",
    public_key: ""
  })

  const { toast } = useToast()

  const handleInputChange = (field: keyof typeof walletData, value: string) => {
    setWalletData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const saveWallet = () => {
    setIsInputPasswordDrawerOpen(true)
  }

  const saveWithPassword = () => {
    let walletService = new WalletService()
    walletService.createWallet(walletData).then((result) => {
      if (result != null) {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              Wallet Saved Successfully!
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
        <div className="mb-3">
          <Label>Enter a unique wallet name:</Label>
          <Input
            type="text"
            placeholder="Wallet Name"
            value={walletData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Label>Address Type:</Label>
          <Input
            type="text"
            value={walletData.address_type}
            onChange={(e) => handleInputChange("address_type", e.target.value)}
            readOnly
          />
        </div>
        <div className="mb-3">
          <Label>Mnemonic Phrase:</Label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Mnemonic Phrase"
              value={walletData.mnemonic_phrase}
              onChange={(e) =>
                handleInputChange("mnemonic_phrase", e.target.value)
              }
            />
            <Button type="button" variant="variant1" size="icon">
              ↻
            </Button>
          </div>
        </div>
        <div className="mb-3">
          <Label>Secret Key:</Label>
          <Input
            type="text"
            placeholder="Secret Key"
            value={walletData.secret_key}
            onChange={(e) => handleInputChange("secret_key", e.target.value)}
          />
        </div>
        <div className="mb-8">
          <Label>Public Key:</Label>
          <Input
            type="text"
            placeholder="Public Key"
            value={walletData.public_key}
            onChange={(e) => handleInputChange("public_key", e.target.value)}
          />
        </div>
        <div className="mt-3 mb-3">
          <Button type="button" variant="violet" onClick={saveWallet}>
            SAVE
          </Button>
        </div>
      </div>

      <Drawer
        open={isInputPasswordDrawerOpen}
        onOpenChange={setIsInputPasswordDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>SAVE WALLET</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="mb-8">
              <Label className="font-bold pb-2">Enter your password:</Label>
              <Input type="password" placeholder="********" />
            </div>
            <div className="mt-3 mb-3">
              <Button type="button" variant="violet" onClick={saveWithPassword}>
                SAVE
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexAddWallet
