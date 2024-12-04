import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

interface IndexAddWalletProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const IndexAddWallet: React.FC<IndexAddWalletProps> = ({ isDrawerOpen, toggleDrawer }) => {
  return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            ADD WALLET
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
            <Form>
              <div className="mb-3">
                <Label>
                  Enter a unique wallet name:
                </Label>
                <Input
                  type="text"
                  placeholder="Wallet Name"
                />
              </div>

              <div className="mb-3">
                <Label>
                  Address Type:
                </Label>
                <Input
                  type="text"
                  value="Xode"
                  readOnly
                />
              </div>

              <div className="mb-3">
                <Label>
                  Mnemonic Phrase:
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Mnemonic Phrase"
                  />
                  <Button 
                    type="button"
                    variant="variant1"
                    size="icon"
                  >
                    ↻
                  </Button>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-center">
                <Button
                  type="button"
                  variant="variant2"
                  size="lg"
                >
                  Create Key
                </Button>
              </div>

              <div className="mb-3">
                <Label>
                  Secret Key:
                </Label>
                <Input
                  type="text"
                  placeholder="Secret Key"
                />
              </div>

              <div className="mb-3">
                <Label>
                  Public Key:
                </Label>
                <Input
                  type="text"
                  placeholder="Public Key"
                />
              </div>

              <Button
                type="button"
                variant="violet"
                >
                ADD NEW WALLET
              </Button>
            </Form>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexAddWallet;
