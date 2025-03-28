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
import { Check, RefreshCcw, X } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import "@polkadot/wasm-crypto/initOnlyAsm"

import type { NetworkModel } from "@/models/network.model"
import { EncryptionService } from "@/services/encryption.service"
import { UserService } from "@/services/user.service"
import type { ApiPromise } from "@polkadot/api"

interface IndexAddWalletProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
  handleCallbackDataUpdates: () => void
}

const IndexAddWallet = ({
  currentNetwork,
  currentWsAPI,
  handleCallbackDataUpdates
}: IndexAddWalletProps) => {
  const { t } = useTranslation()

  const { toast } = useToast()

  const walletService = useMemo(() => new WalletService(), [])
  const userService = useMemo(() => new UserService(), [])
  const encryptionService = useMemo(() => new EncryptionService(), [])

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [userPassword, setUserPassword] = useState<string>("")
  const [isUserPasswordOpen, setIsUserPasswordOpen] = useState<boolean>(false)

  const [isProcessing, setIsProcessing] = useState(false)

  const [isNameDuplicate, setIsNameDuplicate] = useState(false)
  const [isPublicKeyDuplicate, setIsPublicKeyDuplicate] = useState(false)
  const [wallet, setWallet] = useState<WalletModel>({
    id: 0,
    name: "",
    address_type: "",
    mnemonic_phrase: "",
    secret_key: "",
    public_key: "",
    type: ""
  })

  useEffect(() => {
    if (currentNetwork) {
      setNetwork(currentNetwork)
    }
  }, [currentNetwork])

  useEffect(() => {
    if (currentWsAPI) {
      setWsAPI(currentWsAPI)
    }
  }, [currentWsAPI])

  const checkDuplicateName = async (name: string): Promise<boolean> => {
    const wallets = await walletService.getWallets()
    return wallets.some((d) => d.name === name)
  }

  const checkDuplicatePublicKey = async (publicKey: string): Promise<boolean> => {
    const wallets = await walletService.getWallets()
    const isSome = wallets.some((d) => d.public_key === publicKey)
    return isSome
  }

  const handleInputChange = async (field: keyof typeof wallet, value: string) => {
    if (field === "name") {
      const isDuplicate = await checkDuplicateName(value)
      setIsNameDuplicate(isDuplicate)

      if (isDuplicate) {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              {t("A wallet with this name already exists. Please enter a unique name.")}
            </div>
          ),
          variant: "destructive"
        })
      }
    }

    if (field === "public_key") {
      const isDuplicate = await checkDuplicatePublicKey(value)
      setIsPublicKeyDuplicate(isDuplicate)

      if (isDuplicate) {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              {t("A wallet with this key already exists.")}
            </div>
          ),
          variant: "destructive"
        })
      }
    }

    setWallet((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const generateMnemonic = () => {
    const generatedMnemonicPhrase = mnemonicGenerate()
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

  const handlePasswordChange = async (value: string) => {
    setUserPassword(value)
  }

  const saveWallet = async () => {
    if (isNameDuplicate) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("A wallet with this name already exists. Please enter a unique name.")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    if (isPublicKeyDuplicate) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t(
              "A wallet with this mnemonic phrase already exists. Please enter a unique mnemonic phrase."
            )}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    if (
      !wallet.name ||
      !wallet.mnemonic_phrase ||
      !wallet.secret_key ||
      !wallet.public_key
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

    setIsUserPasswordOpen(true)
  }

  const confirmSave = async () => {
    setIsProcessing(true)

    const isLogin = await userService.login(userPassword)
    if (isLogin) {
      wallet.mnemonic_phrase = encryptionService.encrypt(
        userPassword,
        wallet.mnemonic_phrase
      )
      wallet.secret_key = encryptionService.encrypt(userPassword, wallet.secret_key)
      wallet.address_type = network ? network.name : ""

      const createWallet = await walletService.createWallet(wallet)
      if (createWallet) {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              {t("Wallet Saved Successfully!")}
            </div>
          ),
          variant: "default"
        })

        setIsUserPasswordOpen(false)
        setIsProcessing(false)

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
      <div className="p-6">
        <div className="mb-3">
          <Label>{t("Enter a unique wallet name")}:</Label>
          <Input
            type="text"
            placeholder={t("Wallet Name")}
            value={wallet.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Label>{t("Mnemonic Phrase")}:</Label>
          <div className="flex items-center gap-2">
            <textarea
              placeholder={t("Mnemonic Phrase")}
              value={wallet.mnemonic_phrase}
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
            className="w-[250px] border border-transparent dark:border-white"
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
            value={wallet.secret_key}
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
            value={wallet.public_key}
            onChange={(e) => handleInputChange("public_key", e.target.value)}
            readOnly
          />
        </div>
        <div className="mt-5 mb-3">
          <Button
            type="button"
            variant="jelly"
            onClick={saveWallet}
            disabled={
              isNameDuplicate ||
              isPublicKeyDuplicate ||
              !wallet.name ||
              !wallet.mnemonic_phrase ||
              !wallet.secret_key ||
              !wallet.public_key
            }>
            {t("SAVE")}
          </Button>
        </div>
      </div>

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
                onClick={confirmSave}
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

export default IndexAddWallet
