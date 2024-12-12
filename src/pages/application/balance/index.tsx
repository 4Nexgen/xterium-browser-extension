import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table"
import { address_data } from "@/data/addresses.data"
import { balance_data } from "@/data/balance.data"
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
    image_url: "",
    network: "",
    owner: "",
    description: "",
    balance: "",
    reserveBalance: ""
  })
  const handleCellClick = (
    symbol: string,
    image_url: string,
    network: string,
    owner: string,
    description: string,
    balance: string,
    reserveBalance: string
  ) => {
    setSelectedToken({
      symbol,
      image_url,
      network,
      owner,
      description,
      balance,
      reserveBalance
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="py-4">
      <Label className="text-base mb-2">Address:</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="roundedOutline"
            role="combobox"
            aria-expanded={open}
            className="w-full mb-3 justify-between text-input-primary"
            size="lg">
            {value ? (
              <>
                {address_data.find((address) => address.value === value)?.label}{" "}
                {"{"}
                {value.slice(0, 6)}...{value.slice(-6)}
                {"}"}
              </>
            ) : (
              "Select address"
            )}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[420px] w-[420px] p-1">
          <Command>
            <CommandInput placeholder="Search address..." className="h-9 " />
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
                    <div className="flex flex-col text-input-primary">
                      <span>
                        {address.label} {"{"}
                        {address.value.slice(0, 6)}...{address.value.slice(-6)}
                        {"}"}
                      </span>
                    </div>
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
            {balance_data.map((token) => (
              <TableRow
                key={token.symbol}
                onClick={() =>
                  handleCellClick(
                    token.symbol,
                    token.image_url,
                    token.network,
                    token.owner,
                    token.description,
                    token.balance,
                    token.reserveBalance
                  )
                } // Use the correct function
                className="cursor-pointer hover-bg-custom">
                <TableCell className="w-[50px] justify-center">
                  <img
                    src={token.image_url}
                    className="ml-1 w-10"
                    alt={token.symbol}
                  />
                </TableCell>
                <TableCell>
                  <div className="mb-[2px]">
                    <span className="text-lg font-bold">{token.symbol}</span>
                  </div>
                  <Badge>{token.description}</Badge>
                </TableCell>
                <TableCell className="w-[50px] justify-end pr-2 text-right">
                  <span className="text-lg font-bold text-purple">
                    {token.balance}
                  </span>
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
    </div>
  )
}

export default IndexBalance
