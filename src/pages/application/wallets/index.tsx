import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import type { WalletModel } from "@/models/wallet.model.js"
import { WalletService } from "@/services/wallet.service.js"
import { Check, Copy, Download, Trash } from "lucide-react"
import React, { useEffect, useState } from "react"

import IndexAddWallet from "./addWallet.tsx"
import IndexDeleteWallet from "./deleteWallet"
import IndexExportWallet from "./exportWallet"

const IndexWallet = () => {
  const [wallets, setWallets] = useState<WalletModel[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletModel>({
    id: 0,
    name: "",
    address_type: "",
    mnemonic_phrase: "",
    secret_key: "",
    public_key: ""
  })
  const [isAddWalletDrawerOpen, setIsAddWalletDrawerOpen] = useState(false)
  const [isExportWalletDrawerOpen, setIsExportWalletDrawerOpen] =
    useState(false)
  const [isDeleteWalletDrawerOpen, setIsDeleteWalletDrawerOpen] =
    useState(false)

  const { toast } = useToast()

  const getWallets = () => {
    let walletService = new WalletService()
    walletService.getWallets().then((data) => {
      setWallets(data)
    })
  }

  useEffect(() => {
    getWallets()
  }, [])

  const addWallet = () => {
    setIsAddWalletDrawerOpen(true)
  }

  const copyWallet = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              Copied to clipboard!
            </div>
          ),
          variant: "default"
        })
      })
      .catch(() => {
        toast({
          description: "Failed to copy text.",
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

    setTimeout(() => {
      getWallets()
    }, 100)
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="flex-1">
          <Card className="mb-3">
            <Table>
              <TableBody>
                {wallets.map((address, index) => (
                  <TableRow key={index} className="hover-bg-custom">
                    <TableCell className="px-4">
                      <div className="mb-[2px]">
                        <span className="text-lg font-bold">
                          {address.name}
                        </span>
                      </div>
                      <span style={{ color: "#657AA2" }}>
                        {address.public_key.slice(0, 6)}
                      </span>
                      <span className="text-gray-500">...</span>
                      <span style={{ color: "#657AA2" }}>
                        {address.public_key.slice(-4)}
                      </span>
                    </TableCell>
                    <TableCell className="w-[40px] justify-center text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <button
                              onClick={() => copyWallet(address.public_key)}
                              className="w-full h-full flex items-center justify-center text-white">
                              <Copy />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Address</p>
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
                              className="w-full h-full flex items-center justify-center text-white">
                              <Download />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export Wallet</p>
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
                            <p>Delete Wallet</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <Button variant="violet" className="my-auto" onClick={addWallet}>
          ADD WALLET
        </Button>

        <Drawer
          open={isAddWalletDrawerOpen}
          onOpenChange={setIsAddWalletDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>ADD NEW WALLET</DrawerTitle>
            </DrawerHeader>
            <IndexAddWallet handleCallbacks={callbackUpdates} />
          </DrawerContent>
        </Drawer>

        <Drawer
          open={isExportWalletDrawerOpen}
          onOpenChange={setIsExportWalletDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>EXPORT WALLET</DrawerTitle>
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
              <DrawerTitle>DELETE WALLET</DrawerTitle>
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
