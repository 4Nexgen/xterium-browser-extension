import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area.jsx"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import type { NetworkModel } from "@/models/network.model"
import type { WalletModel } from "@/models/wallet.model"
import { WalletService } from "@/services/wallet.service"
import type { ApiPromise } from "@polkadot/api"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"
import { Check, Copy, Download, LoaderCircle, Trash, Wallet } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import IndexAddWallet from "./addWallet.tsx"
import IndexDeleteWallet from "./deleteWallet"
import IndexExportWallet from "./exportWallet"

interface IndexWalletProps {
  currentNetwork: NetworkModel | null
  currentWsAPI: ApiPromise | null
  handleSetCurrentPage: (currentPage: string) => void
}

const IndexWallet = ({
  currentNetwork,
  currentWsAPI,
  handleSetCurrentPage
}: IndexWalletProps) => {
  const { t } = useTranslation()

  const { toast } = useToast()

  const walletService = useMemo(() => new WalletService(), [])

  const [network, setNetwork] = useState<NetworkModel>(null)
  const [wsAPI, setWsAPI] = useState<ApiPromise | null>(null)

  const [wallets, setWallets] = useState<WalletModel[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [selectedWallet, setSelectedWallet] = useState<WalletModel>({
    id: 0,
    name: "",
    address_type: "",
    mnemonic_phrase: "",
    secret_key: "",
    public_key: "",
    type: ""
  })

  const [isAddWalletDrawerOpen, setIsAddWalletDrawerOpen] = useState(false)
  const [isExportWalletDrawerOpen, setIsExportWalletDrawerOpen] = useState(false)
  const [isDeleteWalletDrawerOpen, setIsDeleteWalletDrawerOpen] = useState(false)
  const [isImportWalletPageOpen, setIsImportWalletPageOpen] = useState(false)

  useEffect(() => {
    setLoading(true)

    if (currentNetwork) {
      setNetwork(currentNetwork)
    }
  }, [currentNetwork])

  useEffect(() => {
    if (currentWsAPI) {
      setWsAPI(currentWsAPI)
    }
  }, [currentWsAPI])

  const getWallets = async () => {
    const wallets = await walletService.getWallets()
    setWallets(wallets)
    setLoading(false)
  }

  useEffect(() => {
    if (wsAPI !== null) {
      getWallets()
    }
  }, [wsAPI])

  const addWallet = () => {
    setIsAddWalletDrawerOpen(true)
  }

  const expandView = () => {
    setIsImportWalletPageOpen(true)

    const extensionId = chrome.runtime.id
    const url = `chrome-extension://${extensionId}/popup.html#import`

    if (window.location.href !== url) {
      window.open(url, "_blank")
    }

    handleCallbacks("import-wallet")
  }

  const importWallet = () => {
    if (!isImportWalletPageOpen) {
      expandView()
      handleSetCurrentPage("import-wallet")
    } else {
      handleSetCurrentPage("import-wallet")
    }
  }

  const copyWallet = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast({
      description: (
        <div className="flex items-center">
          <Check className="mr-2 text-green-500" />
          {t("Copied to clipboard!")}
        </div>
      ),
      variant: "default"
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

  const handleCallbackDataUpdates = () => {
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
      handleSetCurrentPage("Wallets")
      setIsImportWalletPageOpen(false)
    }

    setTimeout(() => {
      getWallets()
    }, 100)
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="p-4">
          <img src={XteriumLogo} className="w-[150px] mx-auto" alt="Xterium Logo" />
        </div>
        <div className="p-4 flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center w-full h-30 gap-4 mt-10">
              <LoaderCircle className="animate-spin h-12 w-12 text-muted" />
              <p className="text-muted ml-2 text-lg">
                {loading ? t("Loading...") : t("Loading...")}
              </p>
            </div>
          ) : wallets.length > 0 ? (
            <ScrollArea className="bg-background border dark:border-muted border-4 rounded p-2 h-[300px]">
              {wallets.map((wallet, index) => (
                <div key={index}>
                  <Card className="mb-1.5 border dark:border-muted bg-[#183F44] rounded-sm">
                    <Table>
                      <TableBody>
                        <TableRow className="hover-bg-custom">
                          <TableCell className="px-4">
                            <div className="mb-[2px]">
                              <span className="text-lg font-bold">{wallet.name}</span>
                            </div>
                            <span className="text-[#7cb9ff]">
                              {wallet.public_key.slice(0, 6)}
                            </span>
                            <span className="text-[#7cb9ff]">...</span>
                            <span className="text-[#7cb9ff]">
                              {wallet.public_key.slice(-4)}
                            </span>
                          </TableCell>
                          <TableCell className="min-w-[30px] flex justify-end items-center text-red-500 pr-4">
                            <div className="flex gap-2 text-right">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      onClick={() => copyWallet(wallet.public_key)}
                                      className="flex items-center justify-center bg-transparent border-0 p-2 hover:bg-transparent"
                                      variant="outline">
                                      <Copy className="text-white" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Copy Address")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      onClick={() => exportWallet(wallet)}
                                      className="flex items-center justify-center bg-transparent border-0 p-2 hover:bg-transparent"
                                      variant="outline">
                                      <Download className="text-white" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Export Wallet")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      onClick={() => deleteWallet(wallet)}
                                      className="flex items-center justify-center bg-transparent border-0 p-2 hover:bg-transparent"
                                      variant="outline">
                                      <Trash className="text-red" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("Delete Wallet")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex flex-col w-full items-center justify-center py-[100px] space-y-2">
              <Wallet className="size-20" />
              <h4 className="font-bold text-lg">{t("Empty")}</h4>
            </div>
          )}

          {!loading && (
            <div className="flex flex-row space-x-2">
              <Button variant="jelly" className="my-auto" onClick={addWallet}>
                {t("ADD WALLET")}
              </Button>
              <Button variant="jelly" className="my-auto" onClick={importWallet}>
                {t("IMPORT WALLET")}
              </Button>
            </div>
          )}
        </div>

        <Drawer open={isAddWalletDrawerOpen} onOpenChange={setIsAddWalletDrawerOpen}>
          <DrawerContent className="border-0">
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">
                {t("ADD NEW WALLET")}
              </DrawerTitle>
            </DrawerHeader>
            <IndexAddWallet
              currentNetwork={network}
              currentWsAPI={wsAPI}
              handleCallbackDataUpdates={handleCallbackDataUpdates}
            />
          </DrawerContent>
        </Drawer>

        <Drawer
          open={isExportWalletDrawerOpen}
          onOpenChange={setIsExportWalletDrawerOpen}>
          <DrawerContent className="border-0">
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">
                {t("EXPORT WALLET")}
              </DrawerTitle>
            </DrawerHeader>
            <IndexExportWallet selectedWallet={selectedWallet} />
          </DrawerContent>
        </Drawer>

        <Drawer
          open={isDeleteWalletDrawerOpen}
          onOpenChange={setIsDeleteWalletDrawerOpen}>
          <DrawerContent className="border-0">
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">
                {t("DELETE WALLET")}
              </DrawerTitle>
            </DrawerHeader>
            <IndexDeleteWallet
              selectedWallet={selectedWallet}
              handleCallbackDataUpdates={handleCallbackDataUpdates}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

export default IndexWallet
