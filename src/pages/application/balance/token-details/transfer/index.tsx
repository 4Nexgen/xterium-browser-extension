import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"

interface IndexTransferProps {
  isTransferOpen: boolean
  closeTransfer: () => void
  walletPublicKey: string
  selectedToken: {
    id: number
    type: string
    symbol: string
    image_url: string
    network: string
    network_id: number
    owner: string
    description: string
    balance: string
    reserveBalance: string
    is_frozen: boolean
  }
}

const IndexTransfer: React.FC<IndexTransferProps> = ({
  isTransferOpen,
  closeTransfer,
  walletPublicKey,
  selectedToken
}) => {
  if (!selectedToken) {
    return <div>Loading...</div>
  }
  const { network, owner, symbol, description, balance, reserveBalance } = selectedToken

  return (
    <Drawer open={isTransferOpen} onOpenChange={closeTransfer}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-purple">TRANSFER</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-4 mt-5 rounded-md border border-2 table-border m-4">
            <Label className="pb-2">
              Network:
              <span className="p-2 font-extrabold text-input-primary">
                {network || "N/A"}
              </span>
            </Label>
            <Label className="pb-2">
              Owner:
              <span className="p-2 font-extrabold text-input-primary">
                {walletPublicKey || "N/A"}
              </span>
            </Label>
            <Label className="pb-2">
              Symbol:
              <span className="p-2 font-extrabold text-input-primary">
                {symbol || "N/A"}
              </span>
            </Label>
            <Label className="pb-2">
              Description:
              <span className="p-2 font-extrabold text-input-primary">
                {description || "N/A"}
              </span>
            </Label>
            <Label className="pb-2">
              Current Balance:
              <span className="p-2 font-extrabold text-input-primary">
                {balance || "0"}
              </span>
            </Label>
            <Label className="pb-2">
              Reserve Balance:
              <span className="p-2 font-extrabold text-input-primary">
                {reserveBalance || "0"}
              </span>
            </Label>
          </div>
          <div className="mt-4 px-4 font-bold">
            <Label htmlFor="quantity">Quantity:</Label>
            <Input
              id="quantity"
              type="text"
              className="mt-2 text-input-primary"
              placeholder="Enter amount"
            />
          </div>
          <div className="mt-4 px-4 font-bold">
            <Label htmlFor="transferTo">Transfer To:</Label>
            <Input
              id="transferTo"
              type="text"
              className="mt-2 text-input-primary"
              placeholder="Enter recipient address"
            />
          </div>
          <div className="p-6">
            <Button variant="jelly" className="w-full" type="button">
              SEND
            </Button>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  )
}

export default IndexTransfer
