"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TokenData } from "@/data/token.data"
import { useToast } from "@/hooks/use-toast"
import { TokenService } from "@/services/token.service"
import { UserService } from "@/services/user.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import OutsideLayout from "../outsideLayout"

const IndexCreatePassword = ({ onSetCurrentPage }) => {
  const { t } = useTranslation()
  const userService = new UserService()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [passwordStrength, setPasswordStrength] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { toast } = useToast()

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const FormSchema = z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
        .regex(/[a-z]/, "Password must include at least one lowercase letter.")
        .regex(/[0-9]/, "Password must include at least one number."),
      confirmPassword: z.string().min(8, "Please confirm your password.")
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"]
    })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  })

  const checkPasswordStrength = (value: string) => {
    if (value.length >= 8) {
      setPasswordStrength("Strong")
    } else if (value.length >= 5) {
      setPasswordStrength("Medium")
    } else {
      setPasswordStrength("Weak")
    }
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    createPassword(data)
  }

  const createPassword = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true)
    try {
      const isValid = await userService.createPassword(data.password)
      if (isValid) {
        await preloadTokens()
        onSetCurrentPage("application")
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
      }
    } catch (error) {
      console.error("Error creating password:", error)
      toast({
        description: t("An error occurred while creating the password."),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const preloadTokens = async () => {
    const tokenService = new TokenService()
    let tokenList = []

    try {
      const data = await tokenService.getTokens()
      let preloadedTokenData = TokenData

      for (let i = 0; i < preloadedTokenData.length; i++) {
        let existingToken = data.find(
          (d) => d.network_id === preloadedTokenData[i].network_id
        )

        if (existingToken) {
          tokenList.push({ ...existingToken, preloaded: true })
        } else {
          await tokenService.createToken(preloadedTokenData[i])
          tokenList.push({ ...preloadedTokenData[i], preloaded: true })
        }
      }

      const updatedTokens = await tokenService.fetchAssetDetailsForTokens(tokenList)
      console.log("Tokens preloaded and updated:", updatedTokens)
    } catch (error) {
      console.error("Error preloading tokens:", error)
    }
  }

  return (
    <>
      <OutsideLayout headerVariant="outside">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-0 h-full">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-inter font-extrabold text-[12px] leading-[15px] text-white tracking-[0.15em] mb-1">
                    {t("Enter Password")}:
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("Enter Password")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          checkPasswordStrength(e.target.value)
                        }}
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="absolute inset-y-0 right-3 flex items-center hover:[#9AB3EB]">
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </FormControl>

                  <div className="p-0 mt-0 text-[10px]">
                    {form.formState.errors.password ? (
                      <FormMessage className="text-[#FD2400] text-[10px] mt-0" />
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-inter font-extrabold text-[12px] leading-[15px] text-white tracking-[0.15em] mb-2">
                    {t("Confirm Password")}:
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("Enter password")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          checkPasswordStrength(e.target.value)
                        }}
                      />
                      <button
                        type="button"
                        onClick={toggleShowConfirmPassword}
                        className="absolute inset-y-0 right-3 flex items-center hover:[#9AB3EB]">
                        {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </FormControl>

                  <div className="p-0 mt-0 text-[10px]">
                    {form.formState.errors.confirmPassword ? (
                      <FormMessage className="text-[#FD2400] text-[10px] mt-0 mb-0" />
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </div>
                </FormItem>
              )}
            />
            <p className="font-inter text-[11px] p-0 font-base text-justify text-white opacity-50">
              {t("Your password is used to unlock your wallet and is securely stored.")}
              {t(
                "We recommend 8 characters with uppercase, lowercase, symbols, and numbers."
              )}
            </p>
            <br />
            <Button
              type="submit"
              variant="jelly"
              className="text-white"
              disabled={isLoading}>
              {isLoading ? t("Processing...") : t("SETUP PASSWORD")}
            </Button>
          </form>
        </Form>
      </OutsideLayout>
    </>
  )
}

export default IndexCreatePassword
