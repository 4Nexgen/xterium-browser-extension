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
import { Check } from "lucide-react"
import React, { useEffect, useState } from "react"

const IndexEditToken = ({ selectedToken, handleCallbacks }) => {
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

  const updateToken = () => {
    tokenData.type = selectedTokenType

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
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-3">
          <Label>Token Type</Label>
          <Popover open={openTokenType} onOpenChange={setOpenTokenType}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full bg-input justify-between h-10">
                {selectedTokenType ? <>{selectedTokenType}</> : <></>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Choose token type..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {tokenTypes.map((tokenType) => (
                      <CommandItem
                        key={tokenType}
                        value={tokenType}
                        onSelect={(value) => {
                          setSelectedTokenType(
                            tokenTypes.find((priority) => priority === value) || null
                          )
                          setOpenTokenType(false)
                        }}>
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
          <Label>Network Id {"(0 if Native)"}:</Label>
          <Input
            type="text"
            placeholder="Enter Network"
            value={tokenData.network_id}
            onChange={(e) => handleInputChange("network_id", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Label>Symbol:</Label>
          <Input
            type="text"
            placeholder="Enter Symbol"
            value={tokenData.symbol}
            onChange={(e) => handleInputChange("symbol", e.target.value)}
          />
        </div>
        <div className="mb-8">
          <Label>Description:</Label>
          <Input
            type="text"
            placeholder="Enter Description"
            value={tokenData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </div>
        <div className="mt-3 mb-3">
          <Button type="button" variant="violet" onClick={updateToken}>
            UPDATE
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexEditToken
