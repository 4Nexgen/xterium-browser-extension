import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { NetworkModel } from "@/models/network.model"
import { NetworkService } from "@/services/network.service"
import { PumpTokenService } from "@/services/pump-token.service"
import { Check, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const IndexSwapPumpToken = ({ handleCallbacks, selectedWallet }) => {
  const { t } = useTranslation()
  const networkService = new NetworkService()
  const pumpTokenService = new PumpTokenService()
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [pumpToken, setPumpToken] = useState<{ amount: string }>({
    amount: ""
  })
  const [isAZKtoXON, setIsAZKtoXON] = useState(true) 
  const { toast } = useToast()
  const [balances, setBalances] = useState<{ XON: number; AZK: number }>({ XON: 0, AZK: 0 });

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  useEffect(() => {
    getNetwork()
  }, [])

  useEffect(() => {
    const fetchBalances = async () => {
      if (selectedWallet) {
        console.log("Selected Wallet:", selectedWallet); 
        const walletBalances = await pumpTokenService.getTokenBalances(selectedWallet.public_key);
        console.log("Fetched Wallet Balances:", walletBalances); 
        setBalances(walletBalances); 
      }
    };
  
    fetchBalances();
  }, [selectedWallet]);

  const handleSwitch = () => {
    setIsAZKtoXON(!isAZKtoXON) 
  }

  const handleSwapPumpToken = (key: string, value: string) => {
    setPumpToken((prevState) => ({
      ...prevState,
      [key]: value,
    }))
  }

  return (
    <>
      <div className="p-6">
        <header className="text-center border-b border-border-1/20 pb-4 text-xl text-muted font-bold">
          {isAZKtoXON ? "AZK To XON" : "XON To AZK"}
        </header>
        <div className="pb-2 pt-6">
          <Button
            className="rounded w-24 h-6 border border-border-1/20 bg-transparent text-gray-400 hover:bg-gray-800"
            type="button"
            onClick={handleSwitch} 
          >
 {isAZKtoXON ? t("Switch to XON") : t("Switch to AZK")}
          </Button>
        </div>
        <div className="border border-muted rounded pb-2">
          <input
            type="text"
            placeholder={t("Enter the Amount")}
            value={pumpToken.amount}
            className="bg-transparent w-full p-3 text-base border-none focus:outline-none"
            onChange={(e) => handleSwapPumpToken("amount", e.target.value)}
          />
          <Label className="pl-3 text-gray-400 opacity-70">
            Balance: {isAZKtoXON ? balances.XON : balances.AZK} 
          </Label>
        </div>
        <div className="mt-5 mb-3">
          <Button type="button" variant="jelly">
            {t("CONFIRM")}
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexSwapPumpToken