import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

interface IndexExportWalletProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const IndexExportWallet: React.FC<IndexExportWalletProps> = ({ isDrawerOpen, toggleDrawer }) => {
  return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            EXPORT WALLET DATA
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
            <Form>
              <div className="mb-8">
                <Label className="font-bold pb-2">
                  Enter your password:
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                />
              </div>
              <Button type="button" variant="violet">
                  CONFIRM
              </Button>
            </Form>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexExportWallet;
