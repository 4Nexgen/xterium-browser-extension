import NetworkSelection from "@/components/network-selection"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NetworkModel } from "@/models/network.model"
import { useTheme } from "next-themes"
import React from "react"
import { useTranslation } from "react-i18next"

interface HeaderProps {
  currentPage?: string
  variant?: "default" | "outside"
  handleCurrentNetwork?: (network: NetworkModel) => Promise<void>
}

const Header = ({
  currentPage,
  variant = "default",
  handleCurrentNetwork
}: HeaderProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <header
      className={`flex top-0 h-[60px] shrink-0 items-center gap-2 px-4 ${variant == "outside" && "justify-end"}`}>
      {variant !== "outside" && (
        <>
          <SidebarTrigger className="rounded" />
          <Breadcrumb className="flex-1 tracking-[0.15em]">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span className="text-muted">{t(currentPage)}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <NetworkSelection handleCurrentNetwork={handleCurrentNetwork} />
        </>
      )}
    </header>
  )
}

export default Header
