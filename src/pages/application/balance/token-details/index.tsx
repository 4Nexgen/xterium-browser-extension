import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface IndexTokenDetailsProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  selectedToken: { symbol: string; logo: string };
}

const IndexTokenDetails: React.FC<IndexTokenDetailsProps> = ({
  isDrawerOpen,
  toggleDrawer,
  selectedToken,
}) => {
    const { symbol, logo } = selectedToken;
  return (
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
            <DrawerTitle>
              {symbol}
            </DrawerTitle>
          </div>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
            <Button
              variant="violet"
              type="submit"
            >
              TRANSFER
            </Button>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexTokenDetails;
