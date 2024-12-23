import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import IndexChangePassword from "@/pages/application/change-password"
import { CurrentPageService } from "@/services/current-page.service"
import { LanguageTranslationService } from "@/services/language-translation.service"
import { Label } from "@radix-ui/react-dropdown-menu"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import {
  ChevronUp,
  Coins,
  DollarSign,
  MessageCircle,
  Network,
  Settings,
  Wallet
} from "lucide-react"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import i18n from "../i18n"
import { Button } from "./ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"

const ApplicationSidebar = ({ onSetCurrentPage, onSetIsLogout }) => {
  const { t } = useTranslation()
  const languageTranslationService = new LanguageTranslationService()
  const currentPageService = new CurrentPageService()

  const applicationItems = [
    {
      title: t("Balance"),
      url: "#",
      icon: DollarSign
    },
    {
      title: t("Tokens"),
      url: "#",
      icon: Coins
    },
    {
      title: t("Network Status"),
      url: "#",
      icon: Network
    },
    {
      title: t("Support"),
      url: "#",
      icon: MessageCircle
    }
  ]

  const setupItems = [
    {
      title: t("Wallets"),
      url: "#",
      icon: Wallet
    }
  ]

  const [isChangePasswordDrawerOpen, setIsChangePasswordDrawerOpen] = useState(false) // State for drawer
  const [isChangeLanguageDrawerOpen, setIsChangeLanguageDrawerOpen] = useState(false) // State for drawer
  const { setTheme } = useTheme()
  const [activeItem, setActiveItem] = useState<string>("")
  const { setOpenMobile } = useSidebar()
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [selectedLangToChange, setSelectedLangToChange] = useState("")

  const getStoredLanguage = () => {
    languageTranslationService
      .getStoredLanguage()
      .then((storedLanguage) => {
        if (storedLanguage) {
          setSelectedLanguage(languageTranslationService.getLanguageName(storedLanguage))
          i18n.changeLanguage(storedLanguage)
        }
      })
      .catch((error) => {
        console.error("Error loading stored language:", error)
      })
  }

  useEffect(() => {
    getStoredLanguage()
  }, [])

  const changeLanguage = (lng: string) => {
    languageTranslationService
      .changeLanguage(lng)
      .then(() => {
        const defaultPage = t("Balance")
        currentPageService.setCurrentPage(defaultPage)
        window.location.reload()
      })
      .catch((error) => {
        console.error("Error changing language:", error)
      })
  }

  const handleLanguageSelection = (lng) => {
    setSelectedLangToChange(lng)
    setIsChangeLanguageDrawerOpen(true)
  }

  const toggleDrawer = () => {
    setIsChangePasswordDrawerOpen(true)
  }

  const handleSignOut = () => {
    onSetIsLogout()
  }

  const callbackUpdates = () => {
    setIsChangePasswordDrawerOpen(false)
    setIsChangeLanguageDrawerOpen(false)
  }

  const expandView = () => {
    const extensionId = chrome.runtime.id
    const url = `chrome-extension://${extensionId}/popup.html#`
    window.open(url, "_blank")
  }

  const retractSidebar = () => {
    setOpenMobile(false)
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <img src={XteriumLogo} className="w-full p-4" alt="Xterium Logo" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("Application")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {applicationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => {
                        setActiveItem(item.title)
                        onSetCurrentPage(item.title)
                        retractSidebar()
                      }}>
                      <a
                        href={item.url}
                        className={cn(
                          "flex items-center space-x-2 p-3 text-sm",
                          activeItem === item.title ? "text-purple bg-sidebar-accent" : ""
                        )}>
                        <div
                          className={cn(
                            "rounded ",
                            activeItem === item.title
                              ? "text-white bg-[var(--sidebar-icon-background)]"
                              : "bg-transparent primary"
                          )}>
                          <item.icon
                            className={cn(
                              activeItem === item.title ? "primary" : "primary",
                              "rounded",
                              "px-1"
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            activeItem === item.title ? "text-purple" : "primary"
                          )}>
                          {item.title}
                        </span>
                        {activeItem === item.title && (
                          <div className="absolute right-2 w-1 h-4 rounded active-item" />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{t("Setup")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {setupItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => {
                        setActiveItem(item.title)
                        onSetCurrentPage(item.title)
                        retractSidebar()
                      }}>
                      <a
                        href={item.url}
                        className={cn(
                          "flex items-center space-x-2 p-3 text-sm",
                          activeItem === item.title ? "text-purple bg-sidebar-accent" : ""
                        )}>
                        <div
                          className={cn(
                            "rounded ",
                            activeItem === item.title
                              ? "text-white bg-[var(--sidebar-icon-background)]"
                              : "bg-transparent primary"
                          )}>
                          <item.icon
                            className={cn(
                              activeItem === item.title ? "primary" : "primary",
                              "rounded",
                              "px-1"
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            activeItem === item.title ? "text-purple" : "primary"
                          )}>
                          {item.title}
                        </span>
                        {activeItem === item.title && (
                          <div className="absolute right-2 w-1 h-4 rounded active-item" />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Settings /> {t("Settings")}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>{t("Theme")}</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            {t("Light")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            {t("Dark")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setTheme("system")}>
                            {t("System")}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem onClick={expandView}>
                      <span>{t("Expand View")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>{selectedLanguage}</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {["en", "ja", "ko", "zh"].map((lng) => (
                            <DropdownMenuItem
                              key={lng}
                              onClick={() => handleLanguageSelection(lng)}>
                              {languageTranslationService.getLanguageName(lng)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleDrawer}>
                    <span>{t("Change Password")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <span>{t("Sign out")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <p className="text-xs opacity-50 text-right px-2">Xterium v.0.2.1 (Beta)</p>
        </SidebarFooter>
      </Sidebar>

      <Drawer
        open={isChangePasswordDrawerOpen}
        onOpenChange={setIsChangePasswordDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("CHANGE PASSWORD")}</DrawerTitle>
          </DrawerHeader>
          <IndexChangePassword handleCallbacks={callbackUpdates} />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isChangeLanguageDrawerOpen}
        onOpenChange={setIsChangeLanguageDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("CHANGE LANGUAGE")}</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="mb-8">
              <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base">
                {t("Are you sure you want to change the language to")}{" "}
                <span className="font-bold">
                  {languageTranslationService.getLanguageName(selectedLangToChange)}
                </span>
                ?
              </Label>
            </div>
            <div className="flex flex-row space-x-3">
              <Button
                type="button"
                variant="jelly"
                onClick={() => {
                  changeLanguage(selectedLangToChange)
                  setIsChangeLanguageDrawerOpen(false)
                }}>
                {t("CONFIRM")}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ApplicationSidebar
