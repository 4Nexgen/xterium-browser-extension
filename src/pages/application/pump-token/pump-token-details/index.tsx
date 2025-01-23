import React from "react"
import { useTranslation } from "react-i18next"
import XodeLogo from "data-base64:/assets/networks/xode.png"

const IndexPumpTokenDetails = ({ selectedPumpTokens, owner, minBalance, supply }) => {
  const { t } = useTranslation()

  if (!selectedPumpTokens) {
    return <div>{t("Loading...")}</div>
  }

  const { description, price, tokenCreated } = selectedPumpTokens

  const formatCurrency = (amount) => {
    if (!amount) return "0.0"
    const num = parseFloat(amount.replace(/,/g, ""))
    if (isNaN(num)) return "0.0"

    if (num >= 1e24) {
      return `${(num / 1e24).toFixed(4)} T`
    } else if (num >= 1e21) {
      return `${(num / 1e21).toFixed(4)} B`
    } else if (num >= 1e18) {
      return `${(num / 1e18).toFixed(4)} Q`
    } else if (num >= 1e15) {
      return `${(num / 1e15).toFixed(4)} P`
    } else if (num >= 1e12) {
      return `${(num / 1e12).toFixed(4)} T`
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(4)} B`
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(4)} M`
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(4)} k`
    }

    if (Number.isInteger(num)) {
      return `${num}`
    }
    return `${num.toFixed(4)}`
  }

  const formatMinBalance = (amount) => {
    if (!amount) return "0.0000"; 
    const num = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(num)) return "0.0000";

    console.log("Full:", num.toString())
  
    const formattedValue = (num / 1e12).toFixed(4); 
    return formattedValue;
  };

  // const calculateMarketCap = (mint, supply) => {
  //   const marketCap = mint * supply; 
  //   return formatCurrency(marketCap); 
  // };

  return (
    <div className="p-4">
      <div className="w-full flex justify-center mb-4">
        <img
          src={selectedPumpTokens.image_url_cover}
          className="h-24 w-full object-cover object-center rounded-lg"
        />
      </div>
      <div className="flex">
        <div>
          <img
            src={selectedPumpTokens.image_url}
            alt={selectedPumpTokens.name}
            className="rounded-full object-cover h-20 w-20"
          />
        </div>
        <div className="ml-6 w-3/4">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-2">
              <p>
                Created by:{" "}
                <span className="font-semibold">
                  {owner ? `${owner.slice(0, 4)}...${owner.slice(-4)}` : "N/A"}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-x-2">
            <p className="font-semibold">{t("Contract: ")}</p>
            <p className="opacity-70 text-muted">
              {selectedPumpTokens.assetDetail?.assetId ?? "N/A"}
            </p>
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
          </div>
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm">
              {price}
              <img src={XodeLogo} alt="Xode Logo" className="h-4 w-4 inline ml-1 mr-1 mb-0.5" /> 
              XON
            </p>
          </div>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Min Balance")}</p>
          <p className="font-bold text-sm">
            {formatMinBalance(minBalance)} {" "}
            {selectedPumpTokens.assetDetail?.symbol ?? "N/A"}
          </p>
        </div>
        {/* <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Market Cap")}</p>
          <p className="font-bold text-sm">${calculateMarketCap(mint, supply)}</p>
        </div> */}
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Total Supply")}</p>
          <p className="font-bold text-sm">
            {formatCurrency(supply)}
            {selectedPumpTokens.assetDetail?.symbol ?? "N/A"}
          </p>
        </div>
        <div className="border-2 border-primary dark:border-border dark:bg-muted/50 rounded-lg p-2">
          <p className="opacity-70 text-sm">{t("Token Created")}</p>
          <p className="font-bold text-sm">{tokenCreated}</p>
        </div>
      </div>
    </div>
  )
}

export default IndexPumpTokenDetails
