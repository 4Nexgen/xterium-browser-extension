import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Blocks, HandCoins, Hourglass, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"

const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  return num.toLocaleString()
}

const IndexNetworkStatus = () => {
  const { theme } = useTheme()
  const [networkStatus, setNetworkStatus] = useState({
    totalBlocks: 0,
    totalAddresses: 0,
    avgBlockInterval: "0 secs",
    lastGasFee: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      const data = {
        totalBlocks: 1_125_915,
        totalAddresses: 528,
        avgBlockInterval: "12 s",
        lastGasFee: 0.002
      }
      setNetworkStatus(data)
    }

    fetchData()
  }, [])
  return (
    <>
      <Table className="mt-0">
        <TableBody>
          <TableRow className="flex flex-wrap justify-center">
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
            <TableCell className="w-40 h-40 relative">
              <div className="flex items-center justify-center bg-tablecell-detail rounded-xl h-full w-full">
                <div className="text-center p-10 w-full">
                  <Hourglass
                    className="absolute top-0 left-0 ml-6 mt-6 opacity-50"
                    size="40"
                  />
                  <p className="text-2xl font-extrabold text-purple">
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
                  <p className="text-2xl font-extrabold text-purple">
                    {networkStatus.lastGasFee}
                  </p>
                  <Label className="text-sm">Last Gas Fee</Label>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}

export default IndexNetworkStatus
