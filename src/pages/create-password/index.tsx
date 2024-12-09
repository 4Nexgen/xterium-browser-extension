"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import Header from "@/components/Header"
import { CreatePasswordService } from "@/services/create-password.service"
import { Eye, EyeOff } from "lucide-react";

interface Props {
  onSetCurrentPage: (page: string) => void
}

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
      .regex(/[a-z]/, "Password must include at least one lowercase letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export default function IndexCreatePassword({ onSetCurrentPage }: Props) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const [passwordStrength, setPasswordStrength] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const checkPasswordStrength = (value: string) => {
    if (value.length >= 8) {
      setPasswordStrength("Strong");
    } else if (value.length >= 5) {
      setPasswordStrength("Medium");
    } else {
      setPasswordStrength("Weak");
    }
  };

  const onSubmit = (data: { password: string; confirmPassword: string }) => {
    console.log("Password setup successful!", data)

    const passwordService = new CreatePasswordService()
    passwordService.createPassword(data.password)

    onSetCurrentPage("application")
}

  return (
    <div className="flex flex-col justify-between min-h-screen text-white">
      <Header variant="create-password" />

      <div
        className="flex justify-center py-14"
        style={{
          background: "linear-gradient(180deg, #2E266D 0%, #121B26 100%)",
        }}
      >
        <img src={XteriumLogo} className="w-229" alt="Xterium Logo" />
      </div>

      <div
        className="h-3 mt-7"
        style={{
          background: "linear-gradient(90deg, #7292DD 0%, #50B8FF 100%)",
        }}
      />

      <div className="flex justify-center w-full flex-grow">
        <div>
          <div
            className="p-6 w-full h-[290px]"
            style={{
              background: "linear-gradient(180deg, #32436A 0%, #121826 100%)",
            }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-md space-y-3"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="font-inter font-extrabold text-xs leading-[15px] tracking-[0.15em] "
                      >
                        Enter Password:
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              checkPasswordStrength(e.target.value);
                            }}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:[#9AB3EB]"
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="font-inter font-extrabold text-xs leading-[15px] tracking-[0.15em] text-[#9AB3EB]"
                      >
                        Confirm Password:
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute inset-y-0 right-3 flex items-center text-[#9AB3EB] hover:text-[#9AB3EB]"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {passwordStrength && (
                        <p className="text-xs text-[#9AB3EB]">
                          Password Strength: {passwordStrength}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <p className="font-inter text-xs text-[#9AB3EB]  font-base text-justify">
                  Your password is used to unlock your wallet and is securely
                  stored. We recommend 8 characters with uppercase, lowercase,
                  symbols, and numbers.
                </p>
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
