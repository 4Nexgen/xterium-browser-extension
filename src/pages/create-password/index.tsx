"use client"

import Header from "@/components/header"
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
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import { Check, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const IndexCreatePassword = ({ onSetCurrentPage }) => {
  const userService = new UserService()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [passwordStrength, setPasswordStrength] = useState<string>("")

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

  const createPassword = (data: z.infer<typeof FormSchema>) => {
    userService.createPassword(data.password).then((isValid) => {
      if (isValid == true) {
        onSetCurrentPage("application")
      } else {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              Incorrect password!
            </div>
          ),
          variant: "default"
        })
      }
    })
  }

  return (
    <div className="flex flex-col justify-between min-h-screen text-white">
      <Header variant="create-password" />

      <div
        className="flex justify-center pt-14 pb-14"
        style={{
          background: "linear-gradient(180deg, #2E266D 0%, #121B26 100%)"
        }}>
        <img src={XteriumLogo} className="w-229 mb-8" alt="Xterium Logo" />
      </div>

      <div
        className="h-3 mt-7"
        style={{
          background: "linear-gradient(90deg, #7292DD 0%, #50B8FF 100%)"
        }}
      />

      <div className="flex justify-center w-full flex-grow ">
        <div>
          <div
            className="pt-6 px-6 w-full h-full"
            style={{
              background: "linear-gradient(180deg, #32436A 0%, #121826 100%)"
            }}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-md space-y-0 h-full">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-inter font-extrabold text-[12px] leading-[15px] tracking-[0.15em] text-[#9AB3EB] mb-2">
                        Enter Password:
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              checkPasswordStrength(e.target.value)
                            }}
                          />
                          <button
                            type="button"
                            onClick={toggleShowPassword}
                            className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:[#9AB3EB]">
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
                      <FormLabel className="font-inter font-extrabold text-[12px] leading-[15px] tracking-[0.15em] text-[#9AB3EB] mb-2">
                        Confirm Password:
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              checkPasswordStrength(e.target.value)
                            }}
                          />
                          <button
                            type="button"
                            onClick={toggleShowConfirmPassword}
                            className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:[#9AB3EB]">
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                          </button>
                        </div>
                      </FormControl>

                      <div className="p-0 mt-0 text-[10px]">
                        {form.formState.errors.confirmPassword ? (
                          <FormMessage className="text-[#FD2400] text-[10px] mt-0 mb-4" />
                        ) : (
                          <span>&nbsp;</span>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
                <p className="font-inter text-[12px] text-[#9AB3EB] pb-2  font-base text-justify">
                  Your password is used to unlock your wallet and is securely stored. We
                  recommend 8 characters with uppercase, lowercase, symbols, and numbers.
                </p>
                <br />
                <Button type="submit" variant="violet">
                  SETUP PASSWORD
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexCreatePassword
