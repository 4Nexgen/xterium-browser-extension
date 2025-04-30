import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { NetworkLogos } from "@/data/network-logos.data"
import { networkData } from "@/data/networks.data"
import { NetworkModel } from "@/models/network.model"
import { NetworkService } from "@/services/network.service"
import { Label } from "@radix-ui/react-dropdown-menu"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "./ui/button"

interface NetworkSelectionProps {
  handleCurrentNetwork?: (network: NetworkModel) => Promise<void>
}

export default function NetworkSelection({
  handleCurrentNetwork
}: NetworkSelectionProps) {
  const { t } = useTranslation()
  const networkService = new NetworkService()

  const [networks, setNetworks] = useState<NetworkModel[]>([])
  const [openNetworks, setOpenNetworks] = useState<boolean>(false)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [isChangeNetwork, setIsChangeNetwork] = useState<boolean>(false)
  const [chosenNetwork, setChosenNetwork] = useState<NetworkModel>(null)

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
    <div>
      <Drawer>
        <DrawerTrigger>
          <Button
            variant="roundedOutline"
            role="combobox"
            aria-expanded={openNetworks}
            className="w-full h-[30px] justify-between text-input-primary px-2 border-[#3E7596] bg-transparent w-fit"
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
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-4">
            <h2 className="text-center text-xl font-bold mb-4">Select Network</h2>
            <ul>
              {networks.map((network) => (
                <li
                  key={network.name}
                  onClick={() => {
                    setChosenNetwork(
                      networks.find((priority) => priority.name === network.name) || null
                    )
                    setOpenNetworks(false)
                    setIsChangeNetwork(true)
                  }}
                  className={`py-2 px-4 rounded mb-2 cursor-pointer ${
                    selectedNetwork?.name === network.name
                      ? "bg-muted text-black"
                      : "bg-gray-700 hover:bg-accent"
                  }`}>
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
                </li>
              ))}
            </ul>
          </div>
        </DrawerContent>
      </Drawer>
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
    </div>
  )
}
