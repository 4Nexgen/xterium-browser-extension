import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Popover } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NetworkLogos } from "@/data/network-logos.data"
import { networkData } from "@/data/networks.data"
import { NetworkModel } from "@/models/network.model"
import { NetworkService } from "@/services/network.service"
import { Label } from "@radix-ui/react-dropdown-menu"
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { useTheme } from "next-themes"
import Image from "next/image"
import React, { useEffect, useState } from "react"
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
  const networkService = new NetworkService()

  const [networks, setNetworks] = useState<NetworkModel[]>([])
  const [openNetworks, setOpenNetworks] = useState<boolean>(false)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [isChangeNetwork, setIsChangeNetwork] = useState<boolean>(false)
  const [chosenNetwork, setChosenNetwork] = useState<NetworkModel>(null)

  const { theme } = useTheme()

  useEffect(() => {
    if (networkData.length > 0) {
      setNetworks(networkData)
    }
  }, [networkData])

  const getNetworkLogo = (imageName: string) => {
    const networkImages = new NetworkLogos()
    return networkImages.getLogo(imageName)
  }

  const getNetwork = async () => {
    const data = await networkService.getNetwork()
    if (data) {
      setSelectedNetwork(data)
      if (handleCurrentNetwork) handleCurrentNetwork(data)
    } else {
      const defaultNetwork = networks.find((network) => network.name === "Xode")
      if (defaultNetwork) {
        setSelectedNetwork(defaultNetwork)
        networkService.setNetwork(defaultNetwork)

        if (handleCurrentNetwork) handleCurrentNetwork(defaultNetwork)
      }
    }
  }

  useEffect(() => {
    if (networks.length > 0) {
      getNetwork()
    }
  }, [networks])

  const confirmChangeNetwork = () => {
    networkService.setNetwork(chosenNetwork).then((results) => {
      if (results == true) {
        window.location.reload()
      }
    })
  }

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
        </>
      )}
      <div className="w-[200px] min-w-[200px] flex justify-end">
        <Popover open={openNetworks} onOpenChange={setOpenNetworks}>
          <PopoverTrigger asChild>
            <Button
              variant="roundedOutline"
              role="combobox"
              aria-expanded={openNetworks}
              className="w-full h-[30px] justify-between text-input-primary px-2 border-[#3E7596] bg-transparent w-[100px]"
              size="lg">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-2 relative">
                  <Image
                    src={getNetworkLogo(selectedNetwork ? selectedNetwork.name : "")}
                    alt="XON Logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <span className="text-muted font-normal">
                  {selectedNetwork ? selectedNetwork.name : "Select Network"}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 z-[1000] border border-accent rounded-lg"
            align="start">
            <Command>
              <CommandInput placeholder={t("Choose network...")} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {networks.map((network) => (
                    <CommandItem
                      key={network.name}
                      value={network.name}
                      onSelect={(value) => {
                        setChosenNetwork(
                          networks.find((priority) => priority.name === value) || null
                        )
                        setOpenNetworks(false)
                        setIsChangeNetwork(true)
                      }}
                      className="cursor-pointer hover:bg-accent">
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 relative">
                          <Image
                            src={getNetworkLogo(network.name)}
                            alt="XON Logo"
                            style={{ objectFit: "contain" }}
                            fill
                          />
                        </div>
                        {network.name}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Drawer open={isChangeNetwork} onOpenChange={setIsChangeNetwork}>
        <DrawerContent className="border-0">
          <DrawerHeader>
            <DrawerTitle>{t("CHANGE NETWORK")}</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="mb-8">
              <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base">
                {t("Are you sure you want to change the network to")}
                <br />
                <br />
                <div className="flex items-center justify-center space-x-2">
                  <Image
                    src={getNetworkLogo(chosenNetwork ? chosenNetwork.name : "")}
                    alt="XON Logo"
                    width={22}
                    height={22}
                    className="rounded"
                    style={{ objectFit: "contain" }}
                  />
                  <span className="text-lg font-bold text-[#B375DC]">
                    {chosenNetwork ? chosenNetwork.name : "Select Network"}
                  </span>
                  &nbsp;?
                </div>
              </Label>
            </div>
            <div className="flex flex-row space-x-3">
              <Button type="button" variant="jelly" onClick={confirmChangeNetwork}>
                {t("CONFIRM")}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  )
}

export default Header
