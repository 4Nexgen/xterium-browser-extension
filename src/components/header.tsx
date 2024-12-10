import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Popover } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import XONLogo from "data-base64:/assets/tokens/xon.png"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import React, { useState } from "react"

const networks = [{ value: "Mainnet", label: "Mainnet" }]

interface HeaderProps {
  currentPage?: string
  onSetCurrentPage?: (page: string) => void
  variant?: "default" | "create-password" | "login"
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSetCurrentPage,
  variant = "default"
}) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const { theme } = useTheme()

  const handleNetworkChange = (value: string) => {
    setValue(value)
  }

  if (variant === "create-password") {
    return (
      <header
      className="flex top-0 h-[60px] justify-between items-center shrink-0 px-4 "
      style={{
          background: "#2E266D"
        }}>
        <h1 
          className="text-base font-semibold tracking-[0.15em]">
          Setup Password
        </h1>
        <div className="w-[140px]">
          <Popover open={open} onOpenChange={setOpen}>
            <Select value={value} onValueChange={handleNetworkChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent className="w-[140px] p-0 hover-bg-custom">
                <SelectItem value="Mainnet">
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 relative">
                      <Image
                        src={XONLogo}
                        alt="XON Logo"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    Mainnet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </Popover>
        </div>
      </header>
    )
  } else if (variant === "login") {
    return (
      <header
        className="flex top-0 h-[60px] justify-between items-center shrink-0 px-4 "
        style={{
          background: "#2E266D"
        }}>
        <h1 
          className="text-base font-semibold tracking-[0.15em]">
          Login
        </h1>
        <div className="w-[140px]">
          <Popover open={open} onOpenChange={setOpen}>
            <Select value={value} onValueChange={handleNetworkChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent className="w-[140px] p-0 hover-bg-custom">
                <SelectItem value="Mainnet">
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 relative">
                      <Image
                        src={XONLogo}
                        alt="XON Logo"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    Mainnet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </Popover>
        </div>
      </header>
    )
  }

  return (
    <header className="flex top-0 h-[60px] shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="p-2 rounded" />
      <Separator
        orientation="vertical"
        className={`mr-2 h-4 ${theme === "light" ? "" : "bg-white"}`}
      />
      <Breadcrumb className="w-full tracking-[0.15em]">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              <b>{currentPage}</b>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-[228px]">
        <Popover open={open} onOpenChange={setOpen}>
          <Select value={value} onValueChange={handleNetworkChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent className="w-[125px] p-0 hover-bg-custom">
              <SelectItem value="Mainnet">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 relative">
                    <Image
                      src={XONLogo}
                      alt="XON Logo"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  Mainnet
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </Popover>
      </div>
    </header>
  )
}

export default Header
