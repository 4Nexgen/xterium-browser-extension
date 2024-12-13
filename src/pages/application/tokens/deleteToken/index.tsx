import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { TokenModel } from "@/models/token.model"
import { TokenService } from "@/services/token.service"
import { Check } from "lucide-react"
import React, { useState } from "react"

const IndexDeleteToken = ({ selectedToken, handleCallbacks }) => {
  const [tokenData, setTokenData] = useState<TokenModel>(selectedToken)

  const { toast } = useToast()

  const deleteToken = () => {
    let tokenService = new TokenService()
    tokenService.deleteToken(tokenData.id).then((result) => {
      if (result != null) {
        toast({
          description: (
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              Token Deleted Successfully!
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
        <div className="mb-8">
          <Label className="text-center tracking-[0.15em] font-semibold leading-2 font-Inter text-base text-white">
            Are you sure you want to delete <br />
            <span className="text-lg font-bold text-[#B375DC]">
              {tokenData.symbol}
            </span>{" "}
            from your token list?
          </Label>
        </div>
        <div className="flex flex-row space-x-3">
          <Button type="button" variant="jellyDestructive" onClick={deleteToken}>
            DELETE
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexDeleteToken
