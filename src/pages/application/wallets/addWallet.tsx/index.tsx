import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface IndexAddWalletProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const IndexAddWallet: React.FC<IndexAddWalletProps> = ({ isDrawerOpen, toggleDrawer }) => {
  return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent className="bg-gradient-to-b from-[#32436A] to-[#121B26] text-white">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-bold text-purple-400">ADD WALLET</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          {/* Drawer Content */}
          <div className="p-6">
            <form>
              {/* Wallet Name */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-[#9AB3EB]">Enter a unique wallet name</label>
                <input
                  type="text"
                  placeholder="Wallet Name"
                  className="w-full px-3 py-2 bg-[#1B2232] text-[#657AA2] rounded focus:outline-none"
                />
              </div>

              {/* Address Type */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-[#9AB3EB]">Address Type</label>
                <input
                  type="text"
                  value="Xode"
                  readOnly
                  className="w-full px-3 py-2 bg-[#1B2232] text-gray-400 rounded focus:outline-none"
                />
              </div>

              {/* Mnemonic Phrase */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-[#9AB3EB]">Mnemonic Phrase:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Mnemonic Phrase"
                    className="flex-1 px-3 py-2 bg-[#1B2232] text-white rounded focus:outline-none"
                  />
                  <Button type="button" className="bg-[#64629B] text-white hover:bg-[#64629B]">
                    ↻
                  </Button>
                </div>
              </div>

              {/* Create Key Button */}
              <div className="mb-4">
                <Button
                  type="button"
                  className="w-full py-2 bg-[#64629B] text-white hover:bg-[#64629B]"
                >
                  Create Key
                </Button>
              </div>

              {/* Secret Key */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-[#9AB3EB]">Secret Key:</label>
                <input
                  type="text"
                  placeholder="Secret Key"
                  className="w-full px-3 py-2 bg-[#1B2232] text-white rounded focus:outline-none"
                />
              </div>

              {/* Public Key */}
              <div className="mb-4">
                <label className="block text-sm mb-1 text-[#9AB3EB]">Public Key:</label>
                <input
                  type="text"
                  placeholder="Public Key"
                  className="w-full px-3 py-2 text-white bg-[#1B2232] rounded focus:outline-none"
                />
              </div>
              {/* Save Button */}
              <Button
                type="button"
                className="relative w-full py-3 border-2 border-white bg-gradient-to-b from-[#9242AB] via-[#B375DC] to-[#805DC4] text-white font-semibold rounded-full transition-all duration-300 hover:from-[#4247AB] hover:via-[#7C75DC] hover:to-[#805DC4]"
                >
                <span className="relative z-10">ADD NEW WALLET</span>

              </Button>

            </form>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexAddWallet;
