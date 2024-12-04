import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

interface IndexDeleteWalletProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  addressItem: { label: string, value: string }; // Accept addressItem as a prop
}

const IndexDeleteWallet: React.FC<IndexDeleteWalletProps> = ({ isDrawerOpen, toggleDrawer, addressItem }) => {
  return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader >
          <DrawerTitle>
            DELETE WALLET
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
            <Form>
              <div className="mb-8">
                <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base text-white">
                  Are you sure you want to delete <br/>
                  <span className="text-lg font-bold text-[#B375DC]">{addressItem?.label}</span> from your wallet list?
                </Label>
              </div>
              <div className="flex flex-row space-x-3">
                <Button type="button" variant="violet">
                  YES
                </Button>
                <Button type="button" variant="red">
                  NO
                </Button>
              </div>
            </Form>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexDeleteWallet;
