import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model"
import { WalletService } from "@/services/wallet.service"
import { u8aToHex } from "@polkadot/util"
import {
  cryptoWaitReady,
  encodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
  sr25519PairFromSeed
} from "@polkadot/util-crypto"
import { Check, X } from "lucide-react"
import React, { useEffect, useState } from "react"

import "@polkadot/wasm-crypto/initOnlyAsm"

import type { NetworkModel } from "@/models/network.model"
import { EncryptionService } from "@/services/encryption.service"
import { NetworkService } from "@/services/network.service"
import { UserService } from "@/services/user.service"

const IndexAddWallet = ({ handleCallbacks }) => {
  const networkService = new NetworkService()
  const userService = new UserService()
  const walletService = new WalletService()

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
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
  const [inputedPassword, setInputedPassword] = useState<string>("")

  const { toast } = useToast()

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  useEffect(() => {
    getNetwork()
  }, [])

  const handleInputChange = (field: keyof typeof walletData, value: string) => {
    setWalletData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const generateMnemonic = () => {
    let generatedMnemonicPhrase = mnemonicGenerate()
    handleInputChange("mnemonic_phrase", generatedMnemonicPhrase)
    createKeys(generatedMnemonicPhrase)
  }

  const createKeys = (generatedMnemonicPhrase) => {
    cryptoWaitReady().then((isReady) => {
      if (mnemonicValidate(generatedMnemonicPhrase)) {
        const seed = mnemonicToMiniSecret(generatedMnemonicPhrase)
        const { publicKey, secretKey } = sr25519PairFromSeed(seed)

        handleInputChange("secret_key", u8aToHex(secretKey))
        handleInputChange("public_key", encodeAddress(publicKey))
      }
    })
  }

  const saveWallet = () => {
    if (
      !walletData.name ||
      !walletData.mnemonic_phrase ||
      !walletData.secret_key ||
      !walletData.public_key
    ) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            All fields must be filled out!
          </div>
        ),
        variant: "destructive"
      })
      return
    }
    setIsInputPasswordDrawerOpen(true)
  }

  const saveWithPassword = () => {
    if (!inputedPassword.trim()) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            Password cannot be empty!
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    userService.login(inputedPassword).then((isValid) => {
      if (isValid == true) {
        let encryptionService = new EncryptionService()

        let mnemonic_phrase = encryptionService.encrypt(
          inputedPassword,
          walletData.mnemonic_phrase
        )
        let secret_key = encryptionService.encrypt(inputedPassword, walletData.secret_key)

        walletData.mnemonic_phrase = mnemonic_phrase
        walletData.secret_key = secret_key
        walletData.address_type = selectedNetwork ? selectedNetwork.name : ""

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
      } else {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              Invalid Password! Please try again.
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
          <Label>Mnemonic Phrase:</Label>
          <div className="flex items-center gap-2">
            <textarea
              placeholder="Mnemonic Phrase"
              value={walletData.mnemonic_phrase}
              onChange={(e) => handleInputChange("mnemonic_phrase", e.target.value)}
              className="w-full p-2 rounded bg-input text-sm font-semibold"
              rows={2}></textarea>
            <Button
              type="button"
              variant="variant1"
              size="icon"
              onClick={generateMnemonic}>
              ↻
            </Button>
          </div>
        </div>
        <div className="mb-3">
          <Label>Secret Key:</Label>
          <textarea
            placeholder="Secret Key"
            value={walletData.secret_key}
            onChange={(e) => handleInputChange("secret_key", e.target.value)}
            className="w-full p-2 bg-input rounded text-sm font-semibold"
            rows={3}
            readOnly></textarea>
        </div>
        <div className="mb-3">
          <Label>Public Key:</Label>
          <Input
            type="text"
            placeholder="Public Key"
            value={walletData.public_key}
            onChange={(e) => handleInputChange("public_key", e.target.value)}
            readOnly
          />
        </div>
        <div className="mt-5 mb-3">
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
              <Input
                type="password"
                placeholder="********"
                value={inputedPassword}
                onChange={(e) => setInputedPassword(e.target.value)}
              />
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
