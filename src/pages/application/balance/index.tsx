import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import AZKLogo from "data-base64:/assets/tokens/azk.png"
import IXONLogo from "data-base64:/assets/tokens/ixon.png"
import XAVLogo from "data-base64:/assets/tokens/xav.png"
import XGMLogo from "data-base64:/assets/tokens/xgm.png"
import XONLogo from "data-base64:/assets/tokens/xon.png"
import { Check, ChevronsUpDown, Pencil } from "lucide-react"
import React, { useState } from "react"

const addresses = [
  {
    value: "5Clkajsdlashlili3y123211294798910h237",
    label: "Noah (5Clkajsdlashlili3y123211294798910h237)"
  },
  {
    value: "5Blkajsdlaslili3y123211294798910h237",
    label: "Oliver (5Blkajsdlaslili3y123211294798910h237)"
  }
]

const IndexBalance = () => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <>
      <div className="text-base mb-2">Select Address:</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full mb-3 justify-between"
            size="lg">
            {value
              ? addresses.find((address) => address.value === value)?.label
              : "Select address"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[400px] w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search address..." className="h-9" />
            <CommandList>
              <CommandEmpty>No address found.</CommandEmpty>
              <CommandGroup>
                {addresses.map((address) => (
                  <CommandItem
                    key={address.value}
                    value={address.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}>
                    {address.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === address.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Card className="mb-3">
        <CardHeader>
          <CardTitle>
            <b>TOKENS</b>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-[50px] justify-center">
                  <img src={XONLogo} className="ml-1 w-10" />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">XON</span>
                  </div>
                  <Badge>Xode Native Token</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2 text-right">
                  <span className="text-lg font-bold">1,000.00</span>
                </TableCell>
              </TableRow>
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
                <TableCell className="w-[50px] justify-end pr-2 text-right">
                  <span className="text-lg font-bold">100.00</span>
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
                <TableCell className="w-[50px] justify-end pr-2 text-right">
                  <span className="text-lg font-bold">500.00</span>
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
                <TableCell className="w-[50px] justify-end pr-2 text-right">
                  <span className="text-lg font-bold">1,000.00</span>
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
                <TableCell className="w-[50px] justify-end pr-2 text-right">
                  <span className="text-lg font-bold">4,021.00</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

export default IndexBalance
