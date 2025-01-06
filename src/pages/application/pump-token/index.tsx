import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search } from "lucide-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { PumpTokenData } from "@/data/pump-token.data"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import IndexPumpTokenDetails from "./pump-token-details"
import type { PumpTokenModel } from "@/models/pump-token.model"

const truncateText = (text, limit) => {
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const IndexPumpToken = () => {
  const { t } = useTranslation()
  const [openSearch, setOpenSearch] = useState<boolean>(false)
  const [isMockTokenDrawerOpen, setIsMockTokenDrawerOpen] = useState(false)
  const [selectedMockTokens, setSelectedMockTokens] = useState<PumpTokenModel>({
    id: 0,
    name: "",
    symbol: "",
    creator: "",
    contract: "",
    description: "",
    marketCap: "",
    price: "",
    virtualLiquidity: "",
    volume24h: "",
    tokenCreated: "",
    percentage: "",
    image_url: "Default",
  })  

  const handleTokenClick = (token) => {
    setSelectedMockTokens(token)
    setIsMockTokenDrawerOpen(true)
  }

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          <div className="mb-3">
              <Label className="font-bold text-muted">{t("Search")}</Label>
              <Popover open={openSearch} onOpenChange={setOpenSearch}>
                <PopoverTrigger asChild>
                <Button
                    variant="roundedOutline"
                    role="combobox"
                    aria-expanded={openSearch}
                    className="w-full justify-between text-input-primary p-3 font-bold hover:bg-accent"
                    size="lg"
                >
                    <span className="text-muted opacity-70">{t("Search for Tokens")}</span>
                    <Search/>
                </Button>
                </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popper-anchor-width)" }}
              >
                <Command>
                    <CommandInput placeholder={t("Enter Token Name")} />
                    <CommandList>
                      <CommandEmpty>{t("No results found.")}</CommandEmpty>
                      <CommandGroup>
                        {PumpTokenData.map((token) => (
                          <CommandItem 
                            key={token.id} 
                            className="cursor-pointer hover:bg-accent"
                          >
                            {token.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex grid grid-cols-2 sm:grid-cols-2 gap-4">
            {PumpTokenData.map((token) => (
              <div
                key={token.id}
                className="flex flex-col items-start justify-between border-2 border-primary dark:border-border dark:bg-muted/50 rounded-xl h-full"
                onClick={() => handleTokenClick(token)}
              >
              <div className="w-full flex justify-center mb-4">
                <img
                  src={token.image_url}
                  alt={token.name}
                  className="h-36 w-full object-cover object-center rounded-lg"
                />
              </div>
              <h3 className="font-bold text-sm pl-2">
                {token.name} ({token.symbol})
              </h3>
              <p className="pl-2 mt-1">Created by: <span className="text-muted p-4 underline">{token.creator}</span></p>
              <p className="pl-2 pr-2 opacity-50 leading-snug mt-1 mb-1">{truncateText(token.description, 50)}</p>
              <p>
                <span className="opacity-50 pl-2">Market Cap:</span> 
                <span className="font-bold p-4">{token.marketCap}</span>
                <span className="opacity-50">{token.percentage}</span>
              </p>
          </div>
          ))}
          </div>
        </div>
      </div>
      <Drawer
        open={isMockTokenDrawerOpen}
        onOpenChange={setIsMockTokenDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
              {selectedMockTokens ? `${selectedMockTokens.name} (${selectedMockTokens.symbol})` : "Loading..."}
            </DrawerTitle>
          </DrawerHeader>
          {selectedMockTokens ? (
            <IndexPumpTokenDetails
              selectedMockTokens={selectedMockTokens}
              handleCallbacks={() => {}}
            />
          ) : (
            <p>{t("Loading...")}</p> 
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default IndexPumpToken
