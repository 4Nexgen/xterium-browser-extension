"use client"

import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/services/user.service"
import { zodResolver } from "@hookform/resolvers/zod"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import { Eye, EyeOff, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const IndexLogin = ({ onSetCurrentPage }) => {
  const userService = new UserService()

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const { toast } = useToast()

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const FormSchema = z.object({
    password: z.string().min(2, {
      message: ""
    })
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: ""
    }
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    login(data)
  }

  const login = (data: z.infer<typeof FormSchema>) => {
    userService.login(data.password).then((isValid) => {
      if (isValid == true) {
        onSetCurrentPage("application")
      } else {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              Incorrect password!
            </div>
          ),
          variant: "default"
        })
      }
    })
  }

  return (
    <>
      <div className="flex flex-col justify-between min-h-screentext-white">
        <Header variant="login" />

        <div
          className="flex justify-center pt-14 pb-14"
          style={{
            background: "linear-gradient(180deg, #2E266D 0%, #121B26 100%)"
          }}>
          <img src={XteriumLogo} className="w-229 mb-4" alt="Xterium Logo" />
        </div>

        <div
          className="h-3 mt-7"
          style={{
            background: "linear-gradient(90deg, #7292DD 0%, #50B8FF 100%)"
          }}
        />

        <div className="flex justify-center items-center w-full h-full">
          <div className="w-full">
            <div
              className="p-6 w-full h-[290px]"
              style={{
                background: "linear-gradient(180deg, #32436A 0%, #121826 100%)"
              }}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
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
                            />
                            <button
                              type="button"
                              onClick={toggleShowPassword}
                              className="absolute inset-y-0 right-0 px-3 text-sm font-semibold">
                              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="violet" className="w-full">
                    UNLOCK
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </>
  )
}

export default IndexLogin
