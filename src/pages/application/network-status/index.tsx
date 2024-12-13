import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { XodeService } from "@/services/xode.service"
import { Blocks, HandCoins, Hourglass, Wallet } from "lucide-react"
import React, { useEffect, useState } from "react"

const IndexNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    totalBlocks: 0,
    totalAddresses: 0,
    avgBlockInterval: "0",
    lastGasFee: 0
  })

  const xodeService = new XodeService()

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toFixed(1)}T`
    }
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`
    } else {
      return num.toLocaleString()
    }
  }

  const getNetworkStatus = () => {
    xodeService.getTotalBlocks().then((totalBlocks) => {
      xodeService.getTotalAddresses().then((totalAddresses) => {
        setNetworkStatus((prevStatus) => ({
          prevStatus,
          totalBlocks,
          totalAddresses,
          avgBlockInterval: "12 secs",
          lastGasFee: 0.002
        }))
      })
    })
  }

  useEffect(() => {
    getNetworkStatus()
  }, [])

  return (
    <>
      <div className="py-4">
        <Table className="mt-0">
          <TableBody>
            <TableRow className="border-none flex flex-wrap justify-center">
              <TableCell className="w-40 h-40 relative">
                <div className="flex items-center justify-center bg-tablecell-detail rounded-xl h-full w-full">
                  <div className="text-center p-10 w-full">
                    <Blocks
                      className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                      size="40"
                    />
                    <p className="text-2xl font-extrabold text-purple mt-6">
                      {formatNumber(networkStatus.totalBlocks)}
                    </p>
                    <Label className="text-sm">Total Blocks</Label>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-40 h-40 relative">
                <div className="flex items-center justify-center bg-tablecell-detail rounded-xl h-full w-full">
                  <div className="text-center p-10 w-full">
                    <Wallet
                      className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                      size="40"
                    />
                    <p className="text-2xl font-extrabold text-purple mt-6">
                      {formatNumber(networkStatus.totalAddresses)}
                    </p>
                    <Label className="text-sm">Total Addresses</Label>
                  </div>
                </div>
              </TableCell>
            </TableRow>
            <TableRow className="border-none flex flex-wrap justify-center">
              <TableCell className="w-40 h-40 relative">
                <div className="flex items-center justify-center bg-tablecell-detail rounded-xl h-full w-full">
                  <div className="text-center p-10 w-full">
                    <Hourglass
                      className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                      size="40"
                    />
                    <p className="text-2xl font-extrabold text-purple mt-11">
                      {networkStatus.avgBlockInterval}
                    </p>
                    <Label className="text-sm">AVG Block Intervals</Label>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-40 h-40 relative">
                <div className="flex items-center justify-center bg-tablecell-detail rounded-xl h-full w-full">
                  <div className="text-center p-10 w-full">
                    <HandCoins
                      className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                      size="40"
                    />
                    <p className="text-2xl font-extrabold text-purple mt-6">
                      {networkStatus.lastGasFee}
                    </p>
                    <Label className="text-sm">Last Gas Fee</Label>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default IndexNetworkStatus
