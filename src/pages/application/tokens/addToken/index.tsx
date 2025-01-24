import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import type { NetworkModel } from "@/models/network.model"
import { TokenModel } from "@/models/token.model"
import { NetworkService } from "@/services/network.service"
import { TokenService } from "@/services/token.service"
import { Check, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const IndexAddToken = ({ handleCallbacks }) => {
  const { t } = useTranslation()
  const networkService = new NetworkService()
  const tokenService = new TokenService()

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [tokenData, setTokenData] = useState<TokenModel>({
    id: 0,
    type: "",
    network: "",
    network_id: 0,
    symbol: "",
    description: "",
    image_url: "Default"
  })

  const [openTokenType, setOpenTokenType] = useState(false)
  const [tokenTypes, setTokenTypes] = useState<string[]>([])
  const [selectedTokenType, setSelectedTokenType] = useState<string>("")

  const { toast } = useToast()

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  useEffect(() => {
    getNetwork()

    setTimeout(() => {
      setTokenTypes(["Native", "Asset"])
    }, 100)
  }, [])

  const handleInputChange = (field: keyof typeof tokenData, value: string) => {
    setTokenData((prev) => ({
      ...prev,
      [field]: field === "network_id" ? parseInt(value, 10) || 0 : value
    }))
  }

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("symbol", e.target.value.toUpperCase())
  }

  const handleTokenTypeChange = (type: string) => {
    setSelectedTokenType(type)
    if (type === "Native") {
      setTokenData((prev) => ({ ...prev, network_id: 0 }))
    } else if (type === "Asset") {
      setTokenData((prev) => ({ ...prev, network_id: 1 }))
    }
  }

  const saveToken = () => {
    const { network_id, symbol, description } = tokenData

    if (!selectedTokenType || !symbol || !description) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-white-500" />
            {t("All fields must be filled out!")}
          </div>
        ),
        variant: "destructive"
      })

      return
    }

    if (network_id <= 0 && selectedTokenType === "Asset") {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-white-500" />
            {t("Network ID must be greater than 0!")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }

    tokenService.getTokens().then((existingTokens) => {
      const existingTokenWithNetwork = existingTokens.find(
        (token) => token.network_id === network_id
      )
      const existingTokenWithSymbol = existingTokens.find(
        (token) => token.symbol === symbol
      )

      if (existingTokenWithNetwork) {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-white-500" />
              {t("Network ID already exists!")}
            </div>
          ),
          variant: "destructive"
        })
        return
      }

      if (existingTokenWithSymbol) {
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-white-500" />
              {t("Token symbol already exists!")}
            </div>
          ),
          variant: "destructive"
        })
        return
      }

      tokenData.network = selectedNetwork ? selectedNetwork.name : ""
      tokenData.type = selectedTokenType

      tokenService.createToken(tokenData).then((result) => {
        if (result != null) {
          toast({
            description: (
              <div className="flex items-center">
                <Check className="mr-2 text-green-500" />
                {t("Token Saved Successfully!")}
              </div>
            ),
            variant: "default"
          })
        }
      })

      handleCallbacks()
    })
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-3">
          <Label>{t("Token Type")}</Label>
          <Popover open={openTokenType} onOpenChange={setOpenTokenType}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openTokenType}
                className="w-full bg-input justify-between text-input-primary p-3"
                size="lg">
                {selectedTokenType ? selectedTokenType : t("Select Token Type")}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              align="start"
              style={{ width: "var(--radix-popper-anchor-width)" }}>
              <Command>
                <CommandInput placeholder={t("Choose token type...")} />
                <CommandList>
                  <CommandEmpty>{t("No results found.")}</CommandEmpty>
                  <CommandGroup>
                    {tokenTypes.map((tokenType) => (
                      <CommandItem
                        key={tokenType}
                        value={tokenType}
                        onSelect={(value) => {
                          handleTokenTypeChange(value)
                          setOpenTokenType(false)
                        }}
                        className="cursor-pointer hover:bg-accent">
                        {tokenType}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="mb-3">
          <Label>
            {t("Network Id")} {"(0 if Native)"}:
          </Label>
          <Input
            type="number"
            placeholder={t("Enter Network")}
            value={tokenData.network_id}
            onChange={(e) => handleInputChange("network_id", e.target.value)}
            readOnly={selectedTokenType === "Native"}
          />
        </div>
        <div className="mb-3">
          <Label>{t("Symbol")}:</Label>
          <Input
            type="text"
            placeholder={t("Enter Symbol")}
            value={tokenData.symbol}
            onChange={handleSymbolChange}
          />
        </div>
        <div className="mb-8">
          <Label>{t("Description")}:</Label>
          <Input
            type="text"
            placeholder={t("Enter Description")}
            value={tokenData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </div>
        <div className="mt-3 mb-3">
          <Button type="button" variant="jelly" onClick={saveToken}>
            {t("SAVE")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexAddToken
