import { Button } from "@/components/ui/button"
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
import { Check, RefreshCcw, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import "@polkadot/wasm-crypto/initOnlyAsm"

import type { NetworkModel } from "@/models/network.model"
import { EncryptionService } from "@/services/encryption.service"
import { NetworkService } from "@/services/network.service"
import { UserService } from "@/services/user.service"

const IndexAddWallet = ({ handleCallbacks }) => {
  const { t } = useTranslation()
  const networkService = new NetworkService()
  const userService = new UserService()
  const walletService = new WalletService()

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [walletData, setWalletData] = useState<WalletModel>({
    id: 0,
    name: "",
    address_type: "",
    mnemonic_phrase: "",
    secret_key: "",
    public_key: ""
  })

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

  const inputMnemonic = (mnemonicInput) => {
    if (mnemonicValidate(mnemonicInput)) {
      handleInputChange("mnemonic_phrase", mnemonicInput)
      createKeys(mnemonicInput)
    } else {
      handleInputChange("secret_key", "")
      handleInputChange("public_key", "")
    }
  }

  const onUserInput = (event) => {
    const mnemonicInput = event.target.value
    inputMnemonic(mnemonicInput)
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
            {t("All fields must be filled out!")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }
    userService.getWalletPassword().then((decryptedPassword) => {
      if (decryptedPassword) {
        const encryptionService = new EncryptionService()

        const mnemonic_phrase = encryptionService.encrypt(
          decryptedPassword,
          walletData.mnemonic_phrase
        )
        const secret_key = encryptionService.encrypt(
          decryptedPassword,
          walletData.secret_key
        )

        walletData.mnemonic_phrase = mnemonic_phrase
        walletData.secret_key = secret_key
        walletData.address_type = selectedNetwork ? selectedNetwork.name : ""

        walletService.createWallet(walletData).then((result) => {
          if (result != null) {
            toast({
              description: (
                <div className="flex items-center">
                  <Check className="mr-2 text-green-500" />
                  {t("Wallet Saved Successfully!")}
                </div>
              ),
              variant: "default"
            })
          }
        })

        handleCallbacks()
      }
    })
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-3">
          <Label>{t("Enter a unique wallet name")}:</Label>
          <Input
            type="text"
            placeholder={t("Wallet Name")}
            value={walletData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Label>{t("Mnemonic Phrase")}:</Label>
          <div className="flex items-center gap-2">
            <textarea
              placeholder={t("Mnemonic Phrase")}
              value={walletData.mnemonic_phrase}
              onChange={(e) => {
                handleInputChange("mnemonic_phrase", e.target.value)
                onUserInput(e)
              }}
              className="w-full p-2 rounded bg-input text-sm font-semibold"
              rows={2}></textarea>
          </div>
        </div>
        <div className="mb-2 flex items-center justify-center">
          <Button
            type="button"
            className="w-[240px] border border-transparent dark:border-white"
            variant="outline"
            onClick={generateMnemonic}>
            <RefreshCcw />
            {t("Generate Mnemonic Phrase")}
          </Button>
        </div>
        <div className="mb-3">
          <Label>{t("Secret Key")}:</Label>
          <textarea
            placeholder={t("Secret Key")}
            value={walletData.secret_key}
            onChange={(e) => handleInputChange("secret_key", e.target.value)}
            className="w-full p-2 bg-input rounded text-sm font-semibold"
            rows={3}
            readOnly></textarea>
        </div>
        <div className="mb-3">
          <Label>{t("Public Key")}:</Label>
          <Input
            type="text"
            placeholder={t("Public Key")}
            value={walletData.public_key}
            onChange={(e) => handleInputChange("public_key", e.target.value)}
            readOnly
          />
        </div>
        <div className="mt-5 mb-3">
          <Button type="button" variant="jelly" onClick={saveWallet}>
            {t("SAVE")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexAddWallet
