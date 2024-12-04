import IndexAddWallet from "./addWallet.tsx";
import IndexExportWallet from "./exportWallet";
import IndexDeleteWallet from "./deleteWallet";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table";
import {
  Copy,
  Download,
  Trash
} from "lucide-react";
import { address_data } from "@/data/addresses.data";

const IndexWallet = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [isExportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null); // To store the selected address for deletion

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const toggleExportDrawer = () => {
    setExportDrawerOpen(!isExportDrawerOpen);
  };

  const toggleDeleteDrawer = () => {
    setDeleteDrawerOpen(!isDeleteDrawerOpen);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopyMessage("Copied to clipboard!");
        setTimeout(() => {
          setCopyMessage("");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleDownload = () => {
    toggleExportDrawer();
  };

  const handleTrash = (addressItem: any) => {
    setSelectedAddress(addressItem); // Set the address that is selected for deletion
    toggleDeleteDrawer();
  };

  return (
    <div className="relative p-4 flex flex-col h-screen">
      <Card className="mb-3">
        <Table>
          <TableBody>
            {address_data.map((addressItem, index) => (
              <TableRow key={index} className="hover:bg-[#32436A]/100">
                <TableCell className="px-4">
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">{addressItem.label}</span>
                  </div>
                  <span style={{ color: '#657AA2' }}>{addressItem.value.slice(0, 6)}</span>
                  <span className="text-gray-500">...</span>
                  <span style={{ color: '#657AA2' }}>{addressItem.value.slice(-4)}</span>
                </TableCell>
                <TableCell className="w-[40px] justify-center text-center">
                  <button 
                    onClick={() => handleCopy(addressItem.value)} 
                    className="w-full h-full flex items-center justify-center text-white"
                  >
                    <Copy />
                  </button>
                </TableCell>
                <TableCell className="w-[40px] justify-center text-center">
                  <button 
                    onClick={handleDownload} 
                    className="w-full h-full flex items-center justify-center text-white"
                  >
                    <Download />
                  </button>
                </TableCell>
                <TableCell className="w-[30px] justify-center text-center text-red-500 pr-4">
                  <button 
                    onClick={() => handleTrash(addressItem)} // Pass addressItem to handleTrash
                    className="w-full h-full flex items-center justify-center"
                  >
                   <Trash />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {copyMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded-xs shadow-md">
          {copyMessage}
        </div>
      )}

      <Button 
        onClick={toggleDrawer} 
        variant="violet"
        className="mt-auto"
      >
        ADD WALLET
      </Button>

      <IndexAddWallet isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
      <IndexExportWallet isDrawerOpen={isExportDrawerOpen} toggleDrawer={toggleExportDrawer} />
      <IndexDeleteWallet 
        isDrawerOpen={isDeleteDrawerOpen} 
        toggleDrawer={toggleDeleteDrawer} 
        addressItem={selectedAddress} // Pass selected address for deletion
      />
    </div>
  );
};

export default IndexWallet;
