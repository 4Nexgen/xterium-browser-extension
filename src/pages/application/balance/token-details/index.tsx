import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import IndexTransfer from "./transfer";

interface IndexTokenDetailsProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  selectedToken: {
    symbol: string;
    logo: string;
    network: string;
    owner: string;
    description: string;
    currentBalance: string;
    reserveBalance: string;
  };
}

const IndexTokenDetails: React.FC<IndexTokenDetailsProps> = ({
  isDrawerOpen,
  toggleDrawer,
  selectedToken,
}) => {
  const { symbol, logo } = selectedToken;

  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const openTransfer = () => {
    toggleDrawer(); 
    setIsTransferOpen(true); 
  };

  const closeTransfer = () => {
    setIsTransferOpen(false); 
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex justify-center items-center w-full">
              {logo && (
                <Image
                  src={logo}
                  alt={symbol}
                  width={32}
                  height={32}
                  className="mr-2"
                />
              )}
              <DrawerTitle>{symbol}</DrawerTitle>
            </div>
          </DrawerHeader>
          <Label className="mt-4 tracking-[0.15em] font-semibold text-sm text-white text-center">
            Your Balance
          </Label>
          <Table className="mt-6 w-full">
            <TableBody>
              <TableRow className="flex justify-center gap-4">
                <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-purple">0.00</p>
                    <Label className="text-sm font-semibold">Total</Label>
                  </div>
                </TableCell>
                <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-purple">0.00</p>
                    <Label className="text-sm font-semibold">Transferable</Label>
                  </div>
                </TableCell>
                <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-purple">0.00</p>
                    <Label className="text-sm font-semibold">Locked</Label>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <DrawerDescription>
            <div className="p-6">
              <Button variant="violet" type="button" onClick={openTransfer}>
                TRANSFER
              </Button>
            </div>
          </DrawerDescription>
        </DrawerContent>
      </Drawer>

      <IndexTransfer
        isOpen={isTransferOpen}
        toggleDrawer={closeTransfer}
        tokenDetails={selectedToken}
      />
    </>
  );
};

export default IndexTokenDetails;
