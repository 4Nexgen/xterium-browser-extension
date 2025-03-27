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
import type { NetworkModel } from "@/models/network.model"
import type { WalletModel } from "@/models/wallet.model"
import { WalletService } from "@/services/wallet.service"
import type { ApiPromise } from "@polkadot/api"
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
        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center w-full h-30 gap-4 mt-10">
              <LoaderCircle className="animate-spin h-12 w-12 text-muted" />
              <p className="text-muted ml-2 text-lg">
                {loading ? t("Loading...") : t("Loading...")}
              </p>
            </div>
          ) : wallets.length ? (
            <>
              <Card className="mb-3">
                <Table>
                  <TableBody>
                    {wallets.map((address, index) => (
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

              <div className="flex flex-row space-x-2">
                <Button variant="jelly" className="my-auto" onClick={addWallet}>
                  {t("ADD WALLET")}
                </Button>
                <Button variant="jelly" className="my-auto" onClick={importWallet}>
                  {t("IMPORT WALLET")}
                </Button>
              </div>
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

        <Drawer open={isAddWalletDrawerOpen} onOpenChange={setIsAddWalletDrawerOpen}>
          <DrawerContent>
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
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">
                {t("EXPORT WALLET")}
              </DrawerTitle>
            </DrawerHeader>
            <IndexExportWallet
              selectedWallet={selectedWallet}
              handleCallbacks={handleCallbackDataUpdates}
            />
          </DrawerContent>
        </Drawer>

        <Drawer
          open={isDeleteWalletDrawerOpen}
          onOpenChange={setIsDeleteWalletDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-muted border-b border-border-1/20 pb-4">
                {t("DELETE WALLET")}
              </DrawerTitle>
            </DrawerHeader>
            <IndexDeleteWallet
              selectedWallet={selectedWallet}
              handleCallbacks={handleCallbackDataUpdates}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

export default IndexWallet
