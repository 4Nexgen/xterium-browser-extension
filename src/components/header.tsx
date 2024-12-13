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
import { NetworkData } from "@/data/network.data"
import { NetworkImages, type NetworkModel } from "@/models/network.model"
import { NetworkService } from "@/services/network.service"
import { Label } from "@radix-ui/react-dropdown-menu"
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { useTheme } from "next-themes"
import Image from "next/image"
import React, { useEffect, useState } from "react"

interface HeaderProps {
  currentPage?: string
  variant?: "default" | "outside"
}

const Header: React.FC<HeaderProps> = ({ currentPage, variant = "default" }) => {
  const networkService = new NetworkService()

  const [networks, setNetworks] = useState<NetworkModel[]>(NetworkData)
  const [openNetworks, setOpenNetworks] = useState<boolean>(false)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [isChangeNetwork, setIsChangeNetwork] = useState<boolean>(false)
  const [chosenNetwork, setChosenNetwork] = useState<NetworkModel>(null)

  const { theme } = useTheme()

  const getNetworkImage = (imageName: string) => {
    const networkImages = new NetworkImages()
    return networkImages.getBase64Image(imageName)
  }

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  useEffect(() => {
    getNetwork()
  }, [])

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
        </>
      )}
      <div className="w-[160px] min-w-[160px]">
        <Popover open={openNetworks} onOpenChange={setOpenNetworks}>
          <PopoverTrigger asChild>
            <Button
              variant="roundedOutline"
              role="combobox"
              aria-expanded={openNetworks}
              className="w-full justify-between text-input-primary p-3"
              size="lg">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-2 relative">
                  <Image
                    src={getNetworkImage(selectedNetwork ? selectedNetwork.name : "")}
                    alt="XON Logo"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                {selectedNetwork ? selectedNetwork.name : "Select Network"}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 z-[1000]" align="start">
            <Command>
              <CommandInput placeholder="Choose network..." />
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
                      }}>
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 relative">
                          <Image
                            src={getNetworkImage(network.name)}
                            alt="XON Logo"
                            layout="fill"
                            objectFit="contain"
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
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>CHANGE NETWORK</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="mb-8">
              <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base text-white">
                Are you sure you want to change the network to
                <br />
                <br />
                <div className="flex items-center justify-center space-x-2">
                  <Image
                    src={getNetworkImage(chosenNetwork ? chosenNetwork.name : "")}
                    alt="XON Logo"
                    width={22}
                    height={22}
                    className="rounded"
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
                CONFIRM
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  )
}

export default Header
