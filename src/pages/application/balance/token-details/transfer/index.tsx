import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IndexTransferProps {
  isOpen: boolean;
  toggleDrawer: () => void;
  tokenDetails: {
    network: string;
    owner: string;
    symbol: string;
    description: string;
    balance: string;
    reserveBalance: string;
  };
}

const IndexTransfer: React.FC<IndexTransferProps> = ({
  isOpen,
  toggleDrawer,
  tokenDetails,
}) => {
  const {
    network,
    owner,
    symbol,
    description,
    balance,
    reserveBalance,
  } = tokenDetails;

  return (
    <Drawer open={isOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-purple">TRANSFER</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-4 mt-5 rounded-md border border-2 table-border m-4">
            <Label className="pb-2">Network:<span className="p-2 font-extrabold">{network}</span></Label>
            <Label className="pb-2">Owner:<span className="p-2 font-extrabold">{owner}</span></Label>
            <Label className="pb-2">Symbol:<span className="p-2 font-extrabold">{symbol}</span></Label>
            <Label className="pb-2">Description:<span className="p-2 font-extrabold">{description}</span></Label>
            <Label className="pb-2">Current Balance:<span className="p-2 font-extrabold">{balance}</span></Label>
            <Label className="pb-2">Reserve Balance:<span className="p-2 font-extrabold">{reserveBalance}</span></Label>
          </div>
          <div className="mt-4 px-4 font-bold">
            <Label htmlFor="quantity">Quantity:</Label>
            <Input id="quantity" type="text" className="mt-2" placeholder="Enter amount" />
          </div>
          <div className="mt-4 px-4 font-bold">
            <Label htmlFor="transferTo">Transfer To:</Label>
            <Input id="transferTo" type="text" className="mt-2" placeholder="Enter recipient address" />
          </div>
          <div className="p-6">
            <Button variant="violet" className="w-full" type="button">
              SEND
            </Button>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexTransfer;
