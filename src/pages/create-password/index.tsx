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
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/services/user.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, X } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import Layout from "../layout"

interface IndexCreatePasswordProps {
  handleSetCurrentPage?: (currentPage: string) => void
}

const IndexCreatePassword = ({ handleSetCurrentPage }: IndexCreatePasswordProps) => {
  const { t } = useTranslation()

  const userService = useMemo(() => new UserService(), [])

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
        handleSetCurrentPage("application")
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
      toast({
        description: t("An error occurred while creating the password. "),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="sm:bg-background-sheet sm:flex justify-center items-center">
        <Layout headerVariant="outside">
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

                    <div className="p-0 mt-0 text-[12px]">
                      {form.formState.errors.password ? (
                        <FormMessage className="text-[#FD2400] text-[12px] mt-0 mb-2" />
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
                          placeholder={t("Enter confirm password")}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={toggleShowConfirmPassword}
                          className="absolute inset-y-0 right-3 flex items-center hover:[#9AB3EB]">
                          {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>
                    </FormControl>

                    <div className="p-0 mt-0 text-[12px]">
                      {form.formState.errors.confirmPassword ? (
                        <FormMessage className="text-[#FD2400] text-[12px] mt-0 mb-0" />
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
        </Layout>
      </div>
    </>
  )
}

export default IndexCreatePassword
