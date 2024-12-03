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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import XONLogo from "data-base64:/assets/tokens/xon.png"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/Header"


// Zod schema for form validation
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

export default function IndexCreatePassword() {

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (data: { password: string; confirmPassword: string }) => {
    console.log("Password setup successful!", data)
    alert("Password setup successful!")
  }

  return (
    <div className="flex flex-col justify-between min-h-screentext-white">
        <Header
          variant="create-password"
        />

      <div
        className="p-4 flex justify-center py-10"
        style={{
          background: "linear-gradient(180deg, #2E266D 0%, #121B26 100%)",
        }}
      >
        <img src={XteriumLogo} className="w-229" alt="Xterium Logo" />
      </div>

      {/* Gradient line */}
      <div
        className="h-3 mt-7"
        style={{
          background: "linear-gradient(90deg, #7292DD 0%, #50B8FF 100%)",
        }}
      />

      <div className="flex justify-center w-full flex-grow">
        <Card>
          <CardContent 
            className="p-6 w-full"
            style={{
              background: "linear-gradient(180deg, #32436A 0%, #121826 100%)",
            }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-md space-y-6"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="font-inter font-extrabold text-base leading-[15px] tracking-[0.15em] text-[#9AB3EB]"
                      >
                        Enter Password:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className="bg-[#1B2232] text-[#9AB3EB]  text-xs border border-[#3A3D58]"
                        />
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
                        className="font-inter font-extrabold text-base leading-[15px] tracking-[0.15em] text-[#9AB3EB]"
                      >
                        Confirm Password:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          {...field}
                          className="bg-[#1B2232] text-[#9AB3EB] placeholder-[#9AB3EB] text-xs border border-[#3A3D58]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="font-inter text-sm text-[#9AB3EB] mt-2 text-extrabold text-justify">
                  Your password is used to unlock your wallet and is securely
                  stored. We recommend 12 characters with uppercase, lowercase,
                  symbols, and numbers.
                </p>
                <Button
                  type="submit"
                  variant="violet"
                  >
                  SETUP PASSWORD
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
