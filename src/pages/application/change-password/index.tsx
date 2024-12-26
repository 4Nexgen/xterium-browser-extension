import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/services/user.service"
import { Check, Eye, EyeOff } from "lucide-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod"

const IndexChangePassword = ({ handleCallbacks }) => {
  const { t } = useTranslation()
  const userService = new UserService()

  const [oldPassword, setOldPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")

  const [showOldPassword, setShowOldPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

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

  const changePassword = () => {
    try {
      FormSchema.parse({ password: newPassword, confirmPassword })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
        return
      }
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t("All fields are required."))
      return
    }

    userService
      .getPassword(oldPassword)
      .then((existingPassword) => {
        if (existingPassword != null) {
          if (existingPassword !== oldPassword) {
            setError(t("Old password is incorrect."))
            console.log("Old password is incorrect.")
          } else {
            userService.updatePassword(newPassword).then((isUpdated) => {
              if (isUpdated == true) {
                toast({
                  description: (
                    <div className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      {t("Password Changed Successful!")}
                    </div>
                  ),
                  variant: "default"
                })

                setError(null)
                handleCallbacks()
              }
            })
          }
        }
      })
      .catch((error) => {
        setError(error)
      })
  }

  return (
    <>
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
          <Button type="button" variant="jelly" onClick={changePassword}>
            {t("CONFIRM")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexChangePassword
