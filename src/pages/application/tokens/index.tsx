import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import AZKLogo from "data-base64:/assets/tokens/azk.png"
import IXONLogo from "data-base64:/assets/tokens/ixon.png"
import XAVLogo from "data-base64:/assets/tokens/xav.png"
import XGMLogo from "data-base64:/assets/tokens/xgm.png"
import XONLogo from "data-base64:/assets/tokens/xon.png"
import { Pencil } from "lucide-react"
import React from "react"

const IndexTokens = () => {
  return (
    <>
      <Card className="mb-3 card-bg-image">
        <CardHeader>
          <CardTitle>
            <b className="text-white">NATIVE TOKEN</b>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="">
            <TableBody>
              <TableRow>
                <TableCell className="w-[50px] justify-center">
                  <img src={XONLogo} className="ml-1 w-10" />
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
        </CardContent>
      </Card>
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>
            <b>ASSETS</b>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-[50px] justify-center">
                  <img src={XGMLogo} className="ml-1 w-10" />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">XGM</span>
                  </div>
                  <Badge>XGame</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[50px] justify-center">
                  <img src={XAVLogo} className="ml-1 w-10" />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">XAV</span>
                  </div>
                  <Badge>Xavier</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[50px] justify-center">
                  <img src={AZKLogo} className="ml-1 w-10" />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">AZK</span>
                  </div>
                  <Badge>Azkal</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2">
                  <Pencil size="20" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[50px] justify-center">
                  <img src={IXONLogo} className="ml-1 w-10" />
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

export default IndexTokens
