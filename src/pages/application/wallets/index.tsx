import IndexAddWallet from "./addWallet.tsx";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table"
import {
  Copy,
  Download,
  Trash
} from "lucide-react"

const IndexWallet = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="relative p-4 flex flex-col justify-between h-screen">
      <Card className="mb-3">
          <Table>
            <TableBody>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="px-4">
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">Xterium</span>
                  </div>
                  <>5FvuR...71tqR</>
                </TableCell>
                <TableCell className="w-[30px] justify-end text-right">
                  <Copy />
                </TableCell>
                <TableCell className="w-[40px] justify-end text-right">
                  <Download/>
                </TableCell>
                <TableCell className="w-[30px] justify-end text-right text-red-500 pr-4">
                  <Trash />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="px-4">
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">Xterium</span>
                  </div>
                  <>5FvuR...71tqR</>
                </TableCell>
                <TableCell className="w-[30px] justify-end text-right">
                  <Copy />
                </TableCell>
                <TableCell className="w-[40px] justify-end text-right">
                  <Download/>
                </TableCell>
                <TableCell className="w-[30px] justify-end text-right text-red-500 pr-4">
                  <Trash />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="px-4">
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">Xterium</span>
                  </div>
                  <>5FvuR...71tqR</>
                </TableCell>
                <TableCell className="w-[30px] justify-end text-right">
                  <Copy />
                </TableCell>
                <TableCell className="w-[40px] justify-end text-right">
                  <Download/>
                </TableCell>
                <TableCell className="w-[30px] justify-end text-right text-red-500 pr-4">
                  <Trash />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
      </Card>
      {/* Add Wallet Button */}
      <Button 
        onClick={toggleDrawer} 
        variant="violet"
        >
        ADD WALLET
      </Button>

      {/* Drawer Component */}
      <IndexAddWallet isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
    </div>
  );
};

export default IndexWallet;
