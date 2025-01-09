import { Button } from "@/components/ui/button"
import React from "react"
import { useTranslation } from "react-i18next"

const IndexPumpTokenDetails = ({ selectedMockTokens, handleCallbacks }) => {
  const { t } = useTranslation()

  if (!selectedMockTokens) {
    return <div>{t("Loading...")}</div>
  }

  const {
    image_url,
    creator,
    contract,
    description,
    price,
    marketCap,
    virtualLiquidity,
    volume24h,
    tokenCreated
  } = selectedMockTokens

  return (
    <div className="p-6">
      <div className="flex">
          <div>
            <img
              src={image_url}
              alt={selectedMockTokens.name}
              className="rounded-lg object-cover h-40 w-40"
            />
          </div>
        <div className="ml-6 w-3/4">
          <div className="flex items-center gap-x-2">
            <p className="font-semibold">{t("Created by:")}</p>
            <p className="opacity-70 text-muted underline">{creator}</p>
          </div>
          <div className="mt-2 flex items-center gap-x-2">
            <p className="font-semibold">{t("Contract: ")}</p>
            <p className="opacity-70 text-muted">{contract}</p>
          </div>
          <div className="mt-2">
            <p className="opacity-70">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
        <div className="flex items-center">
          <p className="font-semibold text-sm opacity-70 mr-2">{t("Price")}</p>
          <p className="text-muted">+12.29%</p>
        </div>
          <p className="font-bold text-sm">{price}</p>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Market Cap")}</p>
          <p className="font-bold text-sm">{marketCap}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Virtual Liquidity")}</p>
          <p className="font-bold text-sm">{virtualLiquidity}</p>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("24H Volume")}</p>
          <p className="font-bold text-sm">{volume24h}</p>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Token Created")}</p>
          <p className="font-bold text-sm">{tokenCreated}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="jelly" type="button">
          {t("BUY")}
        </Button>
      </div>
    </div>
  )
}

export default IndexPumpTokenDetails
