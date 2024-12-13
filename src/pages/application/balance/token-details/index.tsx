import React, { useEffect, useState } from "react";
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
import { TokenImages } from "@/data/token.data";

interface IndexTokenDetailsProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  selectedToken: {
    id: number;
    type: string;
    symbol: string;
    image_url: string;
    network: string;
    network_id: number;
    owner: string;
    description: string;
    balance: string;
    reserveBalance: string;
    is_frozen: boolean;
  };
  handleCallbacks: () => void;
  walletPublicKey: string;
}

const getTokenImage = async (imageName: string): Promise<string> => {
  const tokenImages = new TokenImages();
  return tokenImages.getBase64Image(imageName);
};

const IndexTokenDetails: React.FC<IndexTokenDetailsProps> = ({
  isDrawerOpen,
  toggleDrawer,
  selectedToken,
  walletPublicKey
}) => {
  const { symbol, image_url } = selectedToken;
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    if (image_url) {
      getTokenImage(image_url)
        .then(setTokenImage)
        .catch((error) => console.error("Error loading image:", error));
    }
  }, [image_url]);

  const openTransfer = () => {
    toggleDrawer(); 
    setIsTransferOpen(true); 
  };

  const closeTransfer = () => {
    setIsTransferOpen(false); 
  };

  const formatBalance = (balance: string) => {
    const parsedBalance = parseFloat(balance);
    return isNaN(parsedBalance) ? "0.00" : parsedBalance.toFixed(2);
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex justify-center items-center w-full">
              {tokenImage ? (
                <Image
                  src={tokenImage}
                  alt={symbol}
                  width={32}
                  height={32}
                  className="mr-2"
                />
              ) : (
                <div>No Image</div>
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
                <TableCell className="w-24 h-24 flex items-center justify-center text-center bg-tablecell-detail rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-purple">{formatBalance(selectedToken.balance)}</p>
                    <Label className="text-sm font-semibold">Total</Label>
                  </div>
                </TableCell>
                <TableCell className="w-24 h-24 flex items-center justify-center bg-tablecell-detail rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-purple">{formatBalance(selectedToken.balance)}</p>
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
          {isTransferOpen && (
            <IndexTransfer
              isTransferOpen={isTransferOpen}
              closeTransfer={closeTransfer}
              walletPublicKey={walletPublicKey}
              selectedToken={selectedToken} 
            />
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default IndexTokenDetails;
