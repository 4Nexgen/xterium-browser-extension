"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import i18n from "@/i18n"
import type { WalletModel } from "@/models/wallet.model"
import { LanguageTranslationService } from "@/services/language-translation.service"
import { WalletService } from "@/services/wallet.service"
import { ArrowLeft, Check, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface IndexImportWalletPageProps {
  handleSetCurrentPage: (currentPage: string) => void
}

const IndexImportWalletPage = ({ handleSetCurrentPage }: IndexImportWalletPageProps) => {
  const { t } = useTranslation()

  const { toast } = useToast()

  const walletService = useMemo(() => new WalletService(), [])
  const languageTranslationService = useMemo(() => new LanguageTranslationService(), [])

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

  const initializedLanguage = async () => {
    const storedLanguage = await languageTranslationService.getStoredLanguage()
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage)
    }
  }

  useEffect(() => {
    initializedLanguage()
  }, [])

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

    setWallet((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result as string)
          const uploadedWallet = jsonData as unknown as WalletModel
          setWallet(uploadedWallet)
        } catch (error) {
          toast({
            description: (
              <div className="flex items-center">
                <X className="mr-2 text-red-500" />
                {t("Failed to read the JSON file!")}
              </div>
            ),
            variant: "destructive"
          })
        }
      }
      reader.readAsText(file)
    }
  }

  useEffect(() => {
    const executePublicKeyChecker = async () => {
      const isDuplicate = await checkDuplicatePublicKey(wallet.public_key)
      setIsPublicKeyDuplicate(isDuplicate)

      if (isDuplicate) {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              {t("This wallet is already exists.")}
            </div>
          ),
          variant: "destructive"
        })
      }
    }

    executePublicKeyChecker()
  }, [wallet])

  const importWallet = async () => {
    setIsProcessing(true)

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
            {t("A wallet with this key already exists.")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    const createWallet = await walletService.createWallet(wallet)
    if (createWallet) {
      toast({
        description: (
          <div className="flex items-center">
            <Check className="mr-2 text-green-500" />
            {t("Wallet Imported Successfully!")}
          </div>
        ),
        variant: "default"
      })

      setIsProcessing(false)
      handleSetCurrentPage(t("Wallets"))
    }
  }

  const handleBackClick = () => {
    handleSetCurrentPage(t("Wallets"))
  }

  return (
    <>
      <div className="bg-background-sheet flex justify-center items-center">
        <div className="bg-white background-inside-theme h-screen max-w-xl w-full">
          <header className=" p-6 flex items-center border-b border-border-1">
            <div
              onClick={handleBackClick}
              className="cursor-pointer flex items-center text-xl">
              <ArrowLeft className="mr-2 ml-3" />
              <span>{t("Import Wallet from JSON")}</span>
            </div>
          </header>
          <div className="p-10">
            <div className="mb-3 flex flex-col">
              <Label>{t("Enter a unique wallet name")}:</Label>
              <Input
                type="text"
                placeholder={t("Wallet Name")}
                value={wallet.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <Label>{t("Upload Wallet JSON")}:</Label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full p-2 rounded bg-input text-sm font-semibold"
              />
            </div>

            <div className="mt-5 mb-3">
              <Button
                type="button"
                variant="jelly"
                className="my-auto"
                disabled={
                  isNameDuplicate ||
                  isPublicKeyDuplicate ||
                  !wallet.name ||
                  !wallet.mnemonic_phrase ||
                  !wallet.secret_key ||
                  !wallet.public_key ||
                  isProcessing
                }
                onClick={importWallet}>
                {t("IMPORT")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </>
  )
}

export default IndexImportWalletPage
