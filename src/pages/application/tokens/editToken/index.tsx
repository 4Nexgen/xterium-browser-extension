import React, { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface IndexEditTokenProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  selectedToken: {
    image_url: string;
    type: string;
    network: string;
    network_id: string;
    symbol: string;
    description: string;
  };
}

const IndexEditToken: React.FC<IndexEditTokenProps> = ({ isDrawerOpen, toggleDrawer, selectedToken }) => {
  const [formData, setFormData] = useState(selectedToken);

  useEffect(() => {
    setFormData(selectedToken); 
  }, [selectedToken]);

  return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader>
        <DrawerTitle className="flex items-center space-x-2">
            <Image
              src={selectedToken.image_url}
              alt={`${selectedToken.symbol} image_url`}
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-lg font-bold">{selectedToken.symbol}</span>
            <span className="ml-2 text-sm text-muted">EDIT TOKEN</span>
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
            <div className="mb-3">
              <Label>Token Type</Label>
              <Input
                type="text"
                placeholder="Token Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <Label>Network</Label>
              <Input
                type="text"
                placeholder="Enter Network"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <Label>Network Id (0 if Native)</Label>
              <Input
                type="text"
                placeholder="Enter Network Id"
                value={formData.network_id}
                onChange={(e) => setFormData({ ...formData, network_id: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <Label>Token Symbol</Label>
              <Input
                type="text"
                placeholder="Token Symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <Label>Description</Label>
              <Input
                type="text"
                placeholder="Token Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="violet"
              onClick={() => {
                console.log('Token saved:', formData);
                toggleDrawer();
              }}
            >
              SAVE
            </Button>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};

export default IndexEditToken;
