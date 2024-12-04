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

export default function IndexLogin() {

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
          variant="login"
        />

      <div
        className="flex justify-center pt-14"
        style={{
          background: "linear-gradient(180deg, #2E266D 0%, #121B26 100%)",
        }}
      >
        <img src={XteriumLogo} className="w-229" alt="Xterium Logo" />
      </div>
      <div className="flex justify-center text-extrabold text-xl py-6">
        <h1>Welcome!</h1>
      </div>

      {/* Gradient line */}
      <div
        className="h-3 mt-7"
        style={{
          background: "linear-gradient(90deg, #7292DD 0%, #50B8FF 100%)",
        }}
      />

      <div className="flex justify-center items-center w-full h-full">
        <Card className="w-full max-w-full sm:max-w-md lg:max-w-lg">
          <div
            className="p-6 w-full"
            style={{
              background: "linear-gradient(180deg, #32436A 0%, #121826 100%)",
            }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="font-inter font-extrabold text-[12px] leading-[15px] tracking-[0.15em] text-[#9AB3EB]"
                      >
                        Enter Password:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant="violet"
                  className="w-full"
                >
                  UNLOCK
                </Button>
              </form>
            </Form>
          </div>
        </Card>
      </div>

    </div>
  )
}
