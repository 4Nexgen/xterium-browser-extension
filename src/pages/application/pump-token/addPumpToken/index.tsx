import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { NetworkModel } from "@/models/network.model"
import type { PumpTokenModel } from "@/models/pump-token.model"
import { NetworkService } from "@/services/network.service"
import { PumpTokenService } from "@/services/pump-token.service"
import { Check, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const IndexAddPumpToken = ({ handleCallbacks }) => {
  console.log("IndexAddPumpToken component mounted")

  const { t } = useTranslation()
  const networkService = new NetworkService()
  const pumpTokenService = new PumpTokenService()
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [pumpTokenData, setPumpTokenData] = useState<PumpTokenModel>({
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
    image_url: undefined,
    network: "Xode",
    network_id: ""
  })

  const { toast } = useToast()

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  useEffect(() => {
    getNetwork()
  }, [])

  const handleInputChange = (field: keyof typeof pumpTokenData, value: string) => {
    setPumpTokenData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPumpTokenData((prev) => ({
          ...prev,
          image_url: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const savePumpToken = async () => {
    const {
      name,
      symbol,
      creator,
      contract,
      description,
      marketCap,
      price,
      virtualLiquidity,
      volume24h,
      tokenCreated,
      percentage,
      image_url,
      network_id
    } = pumpTokenData

    alert("Save button clicked!")
    if (
      !name ||
      !symbol ||
      !creator ||
      !contract ||
      !description ||
      !marketCap ||
      !price ||
      !virtualLiquidity ||
      !volume24h ||
      !tokenCreated ||
      !percentage ||
      // !pumpTokenData.image_url ||
      !network_id
    ) {
      toast({
        description: (
          <div className="flex items-center">
            <X className="mr-2 text-red-500" />
            {t("All fields must be filled out!")}
          </div>
        ),
        variant: "destructive"
      })
      return
    }
    pumpTokenService.getPumpTokens().then((existingPumpTokens) => {
      const existingPumpToken = existingPumpTokens.find(
        (token) => token.network_id === network_id
      )

      if (existingPumpToken) {
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

      pumpTokenData.network = selectedNetwork ? selectedNetwork.name : ""

      pumpTokenService.createPumpToken(pumpTokenData).then((result) => {
        if (result != null) {
          toast({
            description: (
              <div className="flex items-center">
                <Check className="mr-2 text-green-500" />
                {t("Pump Token Saved Successfully!")}
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
        <div className="grid grid-cols-2 gap-6 p-2">
          <div className="mb-3">
            <Label>{t("Enter Pump Token ID")}:</Label>
            <Input
              type="text"
              placeholder={t("Pump Token ID")}
              value={pumpTokenData.id}
              onChange={(e) => handleInputChange("id", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Enter Pump Token Name")}:</Label>
            <Input
              type="text"
              placeholder={t("Pump Token Name")}
              value={pumpTokenData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Symbol")}:</Label>
            <Input
              type="text"
              placeholder={t("Enter Symbol")}
              value={pumpTokenData.symbol}
              onChange={(e) => handleInputChange("symbol", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Creator")}:</Label>
            <Input
              type="text"
              placeholder={t("Creator")}
              value={pumpTokenData.creator}
              onChange={(e) => handleInputChange("creator", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Contract")}:</Label>
            <Input
              type="text"
              placeholder={t("Contract")}
              value={pumpTokenData.contract}
              onChange={(e) => handleInputChange("contract", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Description")}:</Label>
            <Input
              type="text"
              placeholder={t("Enter Description")}
              value={pumpTokenData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Market Cap")}:</Label>
            <Input
              type="text"
              placeholder={t("Enter Market Cap")}
              value={pumpTokenData.marketCap}
              onChange={(e) => handleInputChange("marketCap", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Price")}:</Label>
            <Input
              type="text"
              placeholder={t("Enter Price")}
              value={pumpTokenData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Virtual Liquidity")}:</Label>
            <Input
              type="text"
              placeholder={t("Enter Virtual Liquidity")}
              value={pumpTokenData.virtualLiquidity}
              onChange={(e) => handleInputChange("virtualLiquidity", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Volume24h")}:</Label>
            <Input
              type="text"
              placeholder={t("Volume24h")}
              value={pumpTokenData.volume24h}
              onChange={(e) => handleInputChange("volume24h", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Token Created")}:</Label>
            <Input
              type="text"
              placeholder={t("Token Created")}
              value={pumpTokenData.tokenCreated}
              onChange={(e) => handleInputChange("tokenCreated", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Percentage")}:</Label>
            <Input
              type="text"
              placeholder={t("Percentage")}
              value={pumpTokenData.percentage}
              onChange={(e) => handleInputChange("percentage", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label>{t("Upload Pump Token Image")}:</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full p-2 rounded bg-input text-sm font-semibold"
            />
          </div>
          <div className="mb-3">
            <Label>{t("Network Id")}:</Label>
            <Input
              type="text"
              placeholder={t("Enter Network Id")}
              value={pumpTokenData.network_id}
              onChange={(e) => handleInputChange("network_id", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 mb-3">
          <Button type="button" variant="jelly" onClick={savePumpToken}>
            {t("SAVE")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexAddPumpToken
