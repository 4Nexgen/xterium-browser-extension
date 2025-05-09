import MessageBox from "@/components/message-box"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageBoxController } from "@/controllers/message-box-controller"
import type { WalletModel } from "@/models/wallet.model"
import { EncryptionService } from "@/services/encryption.service"
import { UserService } from "@/services/user.service"
import { WalletService } from "@/services/wallet.service"
import { Eye, EyeOff } from "lucide-react"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod"

interface IndexChangePasswordProps {
  handleCallbackDataUpdates: () => void
}

const IndexChangePassword = ({ handleCallbackDataUpdates }: IndexChangePasswordProps) => {
  const { t } = useTranslation()

  const userService = useMemo(() => new UserService(), [])
  const walletService = useMemo(() => new WalletService(), [])
  const encryptionService = useMemo(() => new EncryptionService(), [])

  const [oldPassword, setOldPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")

  const [showOldPassword, setShowOldPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const toggleShowOldPassword = () => {
    setShowOldPassword(!showOldPassword)
  }

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const FormSchema = z
    .object({
      password: z
        .string()
        .min(8, t("Password must be at least 8 characters."))
        .regex(/[A-Z]/, t("Password must include at least one uppercase letter."))
        .regex(/[a-z]/, t("Password must include at least one lowercase letter."))
        .regex(/[0-9]/, t("Password must include at least one number.")),
      confirmPassword: z.string().min(8, t("Please confirm your password."))
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwords do not match."),
      path: ["confirmPassword"]
    })

  const changePassword = async () => {
    setIsProcessing(true)

    try {
      FormSchema.parse({ password: newPassword, confirmPassword })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
        setIsProcessing(false)
        return
      }
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t("All fields are required."))
      setIsProcessing(false)
      return
    }

    const isLogin = await userService.login(oldPassword)
    if (isLogin) {
      const newEcryptedWallets: WalletModel[] = []
      const wallets = await walletService.getWallets()

      if (wallets.length > 0) {
        wallets.map((wallet) => {
          let mnemonicPhrase = encryptionService.decrypt(
            oldPassword,
            wallet.mnemonic_phrase
          )
          let secretKey = encryptionService.decrypt(oldPassword, wallet.secret_key)

          newEcryptedWallets.push({
            ...wallet,
            mnemonic_phrase: encryptionService.encrypt(newPassword, mnemonicPhrase),
            secret_key: encryptionService.encrypt(newPassword, secretKey)
          })
        })
      }

      const updatePassword = await userService.updatePassword(newPassword)
      if (updatePassword) {
        const reencryptWallets = await walletService.reencryptWallets(newEcryptedWallets)
        if (reencryptWallets) {
          MessageBoxController.show("Password Changed Successful!")
          setError(null)
          setIsProcessing(false)

          handleCallbackDataUpdates()
        }
      }
    } else {
      setError(t("Old password is incorrect."))
      setIsProcessing(false)
    }
  }

  return (
    <>
      <MessageBox />
      <div className="p-6">
        <div className="mb-3">
          <Label className="font-bold">{t("Enter old password")}:</Label>
          <div className="relative">
            <Input
              type={showOldPassword ? "text" : "password"}
              placeholder="********"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleShowOldPassword}
              className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:text-[#9AB3EB]">
              {showOldPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>
        <div className="mb-3">
          <Label className="font-bold">{t("Enter new password")}:</Label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder="********"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleShowNewPassword}
              className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:text-[#9AB3EB]">
              {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>
        <div className="mb-3">
          <Label className="font-bold">{t("Confirm new password")}:</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:text-[#9AB3EB]">
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mt-3 mb-3">
          <Button
            type="button"
            variant="jelly"
            onClick={changePassword}
            disabled={isProcessing}>
            {t("CONFIRM")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexChangePassword
