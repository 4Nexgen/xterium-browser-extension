"use client"

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
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/services/user.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import OutsideLayout from "../outsideLayout"

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
              <X className="mr-2 text-white-500" />
              Incorrect password!
            </div>
          ),
          variant: "destructive"
        })
      }
    })
  }

  return (
    <>
      <OutsideLayout headerVariant="outside">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-inter text-white font-extrabold text-[12px] leading-[15px] tracking-[0.15em] mb-2">
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
            <Button type="submit" variant="violet" className="w-full text-white">
              UNLOCK
            </Button>
          </form>
        </Form>
      </OutsideLayout>
    </>
  )
}

export default IndexLogin
