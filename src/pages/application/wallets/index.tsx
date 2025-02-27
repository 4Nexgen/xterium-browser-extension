import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import type { NetworkModel } from "@/models/network.model.js"
import type { WalletModel } from "@/models/wallet.model.js"
import { NetworkService } from "@/services/network.service.js"
import { WalletService } from "@/services/wallet.service.js"
import { Check, Copy, Download, Trash, Wallet } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexAddWallet from "./addWallet.tsx"
import IndexDeleteWallet from "./deleteWallet"
import IndexExportWallet from "./exportWallet"

const IndexWallet = ({ handleSetCurrentPage }) => {
  const { t } = useTranslation()
  const networkService = new NetworkService()
  const walletService = new WalletService()

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [wallets, setWallets] = useState<WalletModel[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletModel>({
    id: 0,
    name: "",
    address_type: "",
    mnemonic_phrase: "",
    secret_key: "",
    public_key: "",
    balances: [],
    type: ""
  })
  const [isAddWalletDrawerOpen, setIsAddWalletDrawerOpen] = useState(false)
  const [isExportWalletDrawerOpen, setIsExportWalletDrawerOpen] = useState(false)
  const [isDeleteWalletDrawerOpen, setIsDeleteWalletDrawerOpen] = useState(false)
  const [isImportWalletPageOpen, setIsImportWalletPageOpen] = useState(false)

  const { toast } = useToast()

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  const getWallets = () => {
    walletService.getWallets().then((data) => {
      setWallets(data)
    })
  }

  useEffect(() => {
    getNetwork()

    setTimeout(() => {
      getWallets()

      if (window.location.hash === "#import") {
        setIsImportWalletPageOpen(true)
      }
    }, 100)
  }, [])

  const addWallet = () => {
    setIsAddWalletDrawerOpen(true)
  }

  const expandView = () => {
    setIsImportWalletPageOpen(true); 
    const extensionId = chrome.runtime.id
    const url = `chrome-extension://${extensionId}/popup.html#import`
  
    if (window.location.href !== url) {
      window.open(url, "_blank")
    }
    handleCallbacks("import-wallet")
  }
  

  const importWallet = () => {
    if (!isImportWalletPageOpen) { 
      expandView();
      handleSetCurrentPage("import-wallet");
    } else {
      handleSetCurrentPage("import-wallet");
    }
  };

  const copyWallet = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              {t("Copied to clipboard!")}
            </div>
          ),
          variant: "default"
        })
      })
      .catch(() => {
        toast({
          description: t("Failed to copy address."),
          variant: "destructive"
        })
      })
  }

  const exportWallet = (data) => {
    setIsExportWalletDrawerOpen(true)
    setSelectedWallet(data)
  }

  const deleteWallet = (data) => {
    setIsDeleteWalletDrawerOpen(true)
    setSelectedWallet(data)
  }

  const callbackUpdates = () => {
    setIsAddWalletDrawerOpen(false)
    setIsExportWalletDrawerOpen(false)
    setIsDeleteWalletDrawerOpen(false)
    setIsImportWalletPageOpen(false)

    setTimeout(() => {
      getWallets()
    }, 100)
  }

  const handleCallbacks = (action: string) => {
    if (action === "Wallets") {
      handleSetCurrentPage("Wallets");
      setIsImportWalletPageOpen(false);
    }

    setTimeout(() => {
      getWallets() 
    }, 100)
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="flex-1">
          {wallets.filter(
            (wallet) =>
              wallet.address_type === (selectedNetwork ? selectedNetwork.name : "")
          ).length ? (
            <>
              <Card className="mb-3">
                <Table>
                  <TableBody>
                    {wallets
                      .filter(
                        (wallet) =>
                          wallet.address_type ===
                          (selectedNetwork ? selectedNetwork.name : "")
                      )
                      .map((address, index) => (
                        <TableRow key={index} className="hover-bg-custom">
                          <TableCell className="px-4">
                            <div className="mb-[2px]">
                              <span className="text-lg font-bold">{address.name}</span>
                            </div>
                            <span>{address.public_key.slice(0, 6)}</span>
                            <span>...</span>
                            <span>{address.public_key.slice(-4)}</span>
                          </TableCell>
                          <TableCell className="w-[40px] justify-center text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => copyWallet(address.public_key)}
                                    className="w-full h-full flex items-center justify-center">
                                    <Copy />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("Copy Address")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="w-[40px] justify-center text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => exportWallet(address)}
                                    className="w-full h-full flex items-center justify-center">
                                    <Download />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("Export Wallet")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="w-[30px] justify-center text-center text-red-500 pr-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => deleteWallet(address)}
                                    className="w-full h-full flex items-center justify-center">
                                    <Trash />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("Delete Wallet")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <div className="flex flex-col gap-4 items-center py-[100px]">
              <Wallet className="size-20" />
              <div className="text-center">
                <h4 className="font-bold text-lg">{t("No Wallet Found")}</h4>
                <p className="opacity-50">
                  {t("Add new wallet by clicking the button below.")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-row space-x-2">
          <Button variant="jelly" className="my-auto" onClick={addWallet}>
            {t("ADD WALLET")}
          </Button>
          <Button variant="jelly" className="my-auto" onClick={importWallet}>
            {t("IMPORT WALLET")}
          </Button>
        </div>


        <Drawer open={isAddWalletDrawerOpen} onOpenChange={setIsAddWalletDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">{t("ADD NEW WALLET")}</DrawerTitle>
            </DrawerHeader>
            <IndexAddWallet handleCallbacks={callbackUpdates} />
          </DrawerContent>
        </Drawer>

        <Drawer
          open={isExportWalletDrawerOpen}
          onOpenChange={setIsExportWalletDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">{t("EXPORT WALLET")}</DrawerTitle>
            </DrawerHeader>
            <IndexExportWallet
              selectedWallet={selectedWallet}
              handleCallbacks={callbackUpdates}
            />
          </DrawerContent>
        </Drawer>

        <Drawer
          open={isDeleteWalletDrawerOpen}
          onOpenChange={setIsDeleteWalletDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">{t("DELETE WALLET")}</DrawerTitle>
            </DrawerHeader>
            <IndexDeleteWallet
              selectedWallet={selectedWallet}
              handleCallbacks={callbackUpdates}
            />
          </DrawerContent>
        </Drawer>
      </div>

    </>
  )
}

export default IndexWallet
