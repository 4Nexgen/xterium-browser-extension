import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
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
import IXAVLogo from "data-base64:/assets/tokens/ixav.png"
import { Check, ChevronsUpDown, Pencil } from "lucide-react"
import React, { useState } from "react"
import IndexTokenDetails from "./token-details"

const addresses = [
  {
    value: "5Clkajsdlashlili3y123211294798910h237",
    label: "Noah (5Clka...0h237)"
  },
  {
    value: "5Blkajsdlaslili3y123211294798910h237",
    label: "Oliver (5Blka...0h237)"
  }
]

const tokens = [
  { symbol: "XON", name: "Native XON Token", balance: "1,000.00", logo: XONLogo },
  { symbol: "XGM", name: "XGame Utility Token", balance: "100.00", logo: XGMLogo },
  { symbol: "XAV", name: "Xaver Utility Token", balance: "500.00", logo: XAVLogo },
  { symbol: "AZK", name: "Azkal Meme Token", balance: "1,000.00", logo: AZKLogo },
  { symbol: "IXON", name: "Private XON Token", balance: "4,021.00", logo: IXONLogo },
  { symbol: "IXAV", name: "Private XAV Token", balance: "4,021.00", logo: IXAVLogo },
];

const IndexBalance = () => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({
    symbol: "",
    logo: "",
  });
  const handleCellClick = (symbol: string, logo: string) => {
    setSelectedToken({ symbol, logo });
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="text-base mb-2">Address:</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="roundedOutline"
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
        <CardContent>
        <Table>
        <TableBody>
          {tokens.map((token) => (
            <TableRow
              key={token.symbol}
              onClick={() => handleCellClick(token.symbol, token.logo)} // Use the correct function
              className="cursor-pointer hover:bg-gray-800"
            >
              <TableCell className="w-[50px] justify-center">
                <img src={token.logo} className="ml-1 w-10" alt={token.symbol} />
              </TableCell>
              <TableCell>
                <div className="mb-[2px]">
                  <span className="text-lg font-bold">{token.symbol}</span>
                </div>
                <span>{token.name}</span>
              </TableCell>
              <TableCell className="w-[50px] justify-end pr-2 text-right">
                <span className="text-lg font-bold">{token.balance}</span>
              </TableCell>
            </TableRow>          
          ))}
        </TableBody>
      </Table>

      <IndexTokenDetails
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        selectedToken={selectedToken}
      />
        </CardContent>
      </Card>
    </>
  )
}

export default IndexBalance
