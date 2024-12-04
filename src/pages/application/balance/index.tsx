import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
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
import { Drawer } from "@/components/ui/drawer"
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
import { address_data } from "@/data/addresses.data"
import { token_data } from "@/data/tokens.data"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Pencil } from "lucide-react"
import React, { useState } from "react"

import IndexTokenDetails from "./token-details"

const IndexBalance = () => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState({
    symbol: "",
    logo: ""
  })
  const handleCellClick = (symbol: string, logo: string) => {
    setSelectedToken({ symbol, logo })
    setIsDrawerOpen(true)
  }

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
              ? address_data.find((address) => address.value === value)?.label
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
                {address_data.map((address) => (
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
        <Table>
          <TableBody>
            {token_data.map((token) => (
              <TableRow
                key={token.symbol}
                onClick={() => handleCellClick(token.symbol, token.logo)} // Use the correct function
                className="cursor-pointer hover:bg-[#32436A]/100 px-4">
                <TableCell className="w-[50px] justify-center">
                  <img
                    src={token.logo}
                    className="ml-1 w-10"
                    alt={token.symbol}
                  />
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
      </Card>
    </>
  )
}

export default IndexBalance
