import IndexAddWallet from "./addWallet.tsx";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table"
import {
  Copy,
  Download,
  Delete
} from "lucide-react"

const IndexWallet = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="relative p-4 flex flex-col h-screen">
      <Card className="mb-3">
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
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
                <TableCell className="w-[30px] justify-end text-right">
                  <Delete />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
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
                <TableCell className="w-[30px] justify-end text-right">
                  <Delete />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
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
                <TableCell className="w-[30px] justify-end text-right">
                  <Delete />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Add Wallet Button */}
      <Button 
        onClick={toggleDrawer} 
        className="relative w-full py-3 border-2 border-white bg-gradient-to-b from-[#9242AB] via-[#B375DC] to-[#805DC4] text-white font-semibold rounded-full transition-all duration-300 hover:from-[#4247AB] hover:via-[#7C75DC] hover:to-[#805DC4] mt-auto"
        >
        ADD WALLET
      </Button>

      {/* Drawer Component */}
      <IndexAddWallet isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
    </div>
  );
};

export default IndexWallet;
