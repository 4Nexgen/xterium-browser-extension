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
import i18n from "@/i18n"
import { LanguageTranslationService } from "@/services/language-translation.service"
import { UserService } from "@/services/user.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import OutsideLayout from "../layout"

const IndexLogin = ({ onSetCurrentPage }) => {
  const { t } = useTranslation()

  const userService = useMemo(() => new UserService(), [])
  const languageTranslationService = useMemo(() => new LanguageTranslationService(), [])

  const [selectedLanguage, setSelectedLanguage] = useState("English")

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const { toast } = useToast()

  const initializedLanguage = async () => {
    const storedLanguage = await languageTranslationService.getStoredLanguage()
    if (storedLanguage) {
      const languageName = languageTranslationService.getLanguageName(storedLanguage)

      setSelectedLanguage(languageName)
      i18n.changeLanguage(storedLanguage)
    }
  }

  useEffect(() => {
    initializedLanguage()
  }, [])

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

  const login = async (data: z.infer<typeof FormSchema>) => {
    const isLogin = await userService.login(data.password)
    if (isLogin) {
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
  }

  return (
    <>
      <div className="sm:bg-background-sheet sm:flex justify-center items-center">
        <OutsideLayout headerVariant="outside">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4 lg:space-y-">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-inter text-white font-extrabold text-[12px] leading-[15px] tracking-[0.15em] mb-2">
                      {t("Enter Password")}:
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("Enter password")}
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
              <Button type="submit" variant="jelly" className="w-full text-white">
                {t("UNLOCK")}
              </Button>
            </form>
          </Form>
        </OutsideLayout>
      </div>
    </>
  )
}

export default IndexLogin
