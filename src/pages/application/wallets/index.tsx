import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { address_data } from "@/data/addresses.data"
import { useToast } from "@/hooks/use-toast"
import { Check, Copy, Download, Trash } from "lucide-react"
import React, { useState } from "react"

import IndexAddWallet from "./addWallet.tsx"
import IndexDeleteWallet from "./deleteWallet"
import IndexExportWallet from "./exportWallet"

const IndexWallet = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isExportDrawerOpen, setExportDrawerOpen] = useState(false)
  const [isDeleteDrawerOpen, setDeleteDrawerOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const { toast } = useToast()

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen)
  }

  const toggleExportDrawer = () => {
    setExportDrawerOpen(!isExportDrawerOpen)
  }

  const toggleDeleteDrawer = () => {
    setDeleteDrawerOpen(!isDeleteDrawerOpen)
  }

  const handleCopy = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" /> {/* Check icon */}
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

  const handleDownload = () => {
    toggleExportDrawer()
  }

  const handleTrash = (addressItem: any) => {
    setSelectedAddress(addressItem)
    toggleDeleteDrawer()
  }

  return (
    <div className="py-4 flex flex-col justify-between h-full">
      <div className="flex-1">
        <Card className="mb-3">
          <Table>
            <TableBody>
              {address_data.map((addressItem, index) => (
                <TableRow key={index} className="hover-bg-custom">
                  <TableCell className="px-4">
                    <div className="mb-[2px]">
                      <span className="text-lg font-bold">
                        {addressItem.label}
                      </span>
                    </div>
                    <span style={{ color: "#657AA2" }}>
                      {addressItem.value.slice(0, 6)}
                    </span>
                    <span className="text-gray-500">...</span>
                    <span style={{ color: "#657AA2" }}>
                      {addressItem.value.slice(-4)}
                    </span>
                  </TableCell>
                  <TableCell className="w-[40px] justify-center text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => handleCopy(addressItem.value)}
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
                            onClick={handleDownload}
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
                            onClick={() => handleTrash(addressItem)}
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

      <Button onClick={toggleDrawer} variant="violet" className="my-auto">
        ADD WALLET
      </Button>

      <IndexAddWallet isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
      <IndexExportWallet
        isDrawerOpen={isExportDrawerOpen}
        toggleDrawer={toggleExportDrawer}
      />
      <IndexDeleteWallet
        isDrawerOpen={isDeleteDrawerOpen}
        toggleDrawer={toggleDeleteDrawer}
        addressItem={selectedAddress}
      />
    </div>
  )
}

export default IndexWallet
