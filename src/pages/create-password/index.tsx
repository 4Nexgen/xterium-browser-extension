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

// Network options
const networks = [
  { value: "Mainnet", label: "Mainnet" },
  { value: "Testnet", label: "Testnet" },
]

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
  const [network, setNetwork] = useState("")
  const [open, setOpen] = useState(false)

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
    <div className="flex flex-col min-h-screentext-white">
      {/* Header */}
      <header 
        className="flex justify-between items-center py-4 px-8" 
        style={{
          background: " #2E266D",
        }}
      >
        <div className="text-m font-semibold flex-grow">SETUP PASSWORD</div>
        <div className="flex justify-end w-[180px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex items-center justify-between w-full text-right"
              >
                {network && (
                  <img
                    src={XONLogo}
                    className="w-6 h-6 mr-2 flex-shrink-0"
                    alt={`${network} Logo`}
                  />
                )}
                <span className="truncate">{network || "Select network"}</span>
                <ChevronsUpDown className="ml-auto opacity-50 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Search network..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No network found.</CommandEmpty>
                  <CommandGroup>
                    {networks.map((net) => (
                      <CommandItem
                        key={net.value}
                        value={net.value}
                        onSelect={() => {
                          setNetwork(net.label)
                          setOpen(false)
                        }}
                      >
                        {net.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            network === net.label ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <div
        className="p-4 flex justify-center pt-20"
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
                        className="text-[#9AB3EB]"
                      >
                        Enter Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className="bg-[#1B2232] text-[#657AA2] border border-[#3A3D58]"
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
                        className="text-[#9AB3EB]"
                      >
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          {...field}
                          className="bg-[#1B2232] text-[#657AA2] border border-[#3A3D58]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-[#C3C7D8] mt-2">
                  Your password is used to unlock your wallet and is securely
                  stored. We recommend 12 characters with uppercase, lowercase,
                  symbols, and numbers.
                </p>
                <Button
                  type="submit"
                  className="w-full border-2 border-white bg-gradient-to-b from-[#9242AB] via-[#B375DC] to-[#805DC4] text-white font-semibold rounded-full transition-all duration-300 hover:from-[#4247AB] hover:via-[#7C75DC] hover:to-[#805DC4]"
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
