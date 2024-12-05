import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image"; // Import Image from Next.js
import AZKLogo from "data-base64:/assets/tokens/azk.png";
import IXONLogo from "data-base64:/assets/tokens/ixon.png";
import XAVLogo from "data-base64:/assets/tokens/xav.png";
import XGMLogo from "data-base64:/assets/tokens/xgm.png";
import XONLogo from "data-base64:/assets/tokens/xon.png";
import IXAVLogo from "data-base64:/assets/tokens/ixav.png";
import { Pencil } from "lucide-react";
import React from "react";

const IndexTokens = () => {
  return (
    <>
      <Card className="mb-3 card-bg-image">
        <CardHeader>
          <CardTitle>
            <b className="text-white">NATIVE TOKEN</b>
          </CardTitle>
        </CardHeader>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-[50px] justify-center">
                  <Image src={XONLogo} alt="XON Logo" className="ml-1" width={40} height={40} />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold text-white">XON</span>
                  </div>
                  <Badge>Xode Native Token</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" color="white" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
      </Card>
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>
            <b>ASSETS</b>
          </CardTitle>
        </CardHeader>
          <Table>
            <TableBody>
              <TableRow className="cursor-pointer hover-bg-custom">
                <TableCell className="w-[50px] justify-center">
                  <Image src={XGMLogo} alt="XGM Logo" className="ml-1" width={40} height={40} />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">XGM</span>
                  </div>
                  <Badge>XGame Utility Token</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
              <TableRow className="cursor-pointer hover-bg-custom">
                <TableCell className="w-[50px] justify-center">
                  <Image src={XAVLogo} alt="XAV Logo" className="ml-1" width={40} height={40} />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">XAV</span>
                  </div>
                  <Badge>Xaver Utility Token</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
              <TableRow className="cursor-pointer hover-bg-custom">
                <TableCell className="w-[50px] justify-center">
                  <Image src={AZKLogo} alt="AZK Logo" className="ml-1" width={40} height={40} />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">AZK</span>
                  </div>
                  <Badge>Azkal Meme Token</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
              <TableRow className="cursor-pointer hover-bg-custom">
                <TableCell className="w-[50px] justify-center">
                  <Image src={IXONLogo} alt="IXON Logo" className="ml-1" width={40} height={40} />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">iXON</span>
                  </div>
                  <Badge>Private XON Token</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
              <TableRow className="cursor-pointer hover-bg-custom">
                <TableCell className="w-[50px] justify-center">
                  <Image src={IXAVLogo} alt="IXON Logo" className="ml-1" width={40} height={40} />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">IXAV</span>
                  </div>
                  <Badge>Private XAV Token</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
      </Card>
    </>
  );
};

export default IndexTokens;
