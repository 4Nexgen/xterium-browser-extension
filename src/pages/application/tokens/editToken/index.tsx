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
import { TokenModel } from "@/models/token.model"
import { TokenService } from "@/services/token.service"
import { Check, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const IndexEditToken = ({ selectedToken, handleCallbacks }) => {
  const { t } = useTranslation()
  const tokenService = new TokenService()

  const [tokenData, setTokenData] = useState<TokenModel>(selectedToken)
  const [openTokenType, setOpenTokenType] = useState(false)
  const [tokenTypes, setTokenTypes] = useState<string[]>([])
  const [selectedTokenType, setSelectedTokenType] = useState<string>("")

  const { toast } = useToast()

  useEffect(() => {
    setTokenTypes(["Native", "Asset"])
    setSelectedTokenType(selectedToken.type)
    setTokenData(selectedToken)
  }, [selectedToken])

  const handleInputChange = (field: keyof typeof tokenData, value: string) => {
    setTokenData((prev) => ({
      ...prev,
      [field]: field === "network_id" ? parseInt(value, 10) || 0 : value
    }))
  }

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("symbol", e.target.value.toUpperCase())
  }

  const updateToken = () => {
    tokenData.type = selectedTokenType
    tokenService.getTokens().then((existingTokens) => {
      const duplicateSymbol = existingTokens.find(
        (token) => token.symbol === tokenData.symbol && token.id !== tokenData.id
      )
      const duplicateNetworkId = existingTokens.find(
        (token) => token.network_id === tokenData.network_id && token.id !== tokenData.id
      )

      if (duplicateSymbol || duplicateNetworkId) {
        const errorMsg = duplicateSymbol
          ? "Token symbol already exists."
          : "Network ID already exists."
        toast({
          description: (
            <div className="flex items-center">
              <X className="mr-2 text-red-500" />
              {errorMsg}
            </div>
          ),
          variant: "destructive"
        })
        return
      }
      tokenService.updateToken(tokenData.id, tokenData).then((result) => {
        if (result != null) {
          toast({
            description: (
              <div className="flex items-center">
                <Check className="mr-2 text-green-500" />
                Token Updated Successfully!
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
              <Button variant="outline" className="w-full bg-input justify-between h-10">
                {selectedTokenType ? <>{selectedTokenType}</> : <></>}
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
                          const selectedType = tokenTypes.find((priority) => priority === value) || "Native";
                          setSelectedTokenType(selectedType)
                          if (selectedType === "Native") {
                            setTokenData((prev) => ({
                              ...prev,
                              network_id: 0
                            }))
                          } else if (selectedType === "Asset") {
                            setTokenData((prev) => ({
                              ...prev,
                              network_id: prev.network_id > 0 ? prev.network_id : 1
                            }))
                          }
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
            type="text"
            placeholder={t("Enter Network")}
            value={tokenData.network_id}
            disabled={selectedTokenType === "Native"}
            onChange={(e) => handleInputChange("network_id", e.target.value)}
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
          <Button type="button" variant="jelly" onClick={updateToken}>
            {t("UPDATE")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexEditToken
