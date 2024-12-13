import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { WalletModel } from "@/models/wallet.model";
import type { TokenModel } from "@/models/token.model";
import type { BalanceModel } from "@/models/balance.model";
import type { NetworkModel } from "@/models/network.model.js"
import { WalletService } from "@/services/wallet.service";
import { TokenService } from "@/services/token.service";
import { BalanceServices } from "@/services/balance.service";
import { NetworkService } from "@/services/network.service.js"
import IndexTokenDetails from "./token-details";
import { TokenImages } from "@/data/token.data";

const IndexBalance = () => {
  const walletService = new WalletService();
  const tokenService = new TokenService();
  const balanceService = new BalanceServices();
  const networkService = new NetworkService()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel>(null)
  const [balanceData, setBalanceData] = useState<BalanceModel | null>(null);
  const [wallets, setWallets] = useState<WalletModel[]>([]);
  const [tokens, setTokens] = useState<TokenModel[]>([]);
  const [selectedToken, setSelectedToken] = useState({
    id: 0,
    symbol: "",
    type: "",
    image_url: "Default",
    network: "",
    network_id: 0,
    description: "",
  })

  const [isTokenDetailDrawerOpen, setIsTokenDetailDrawerOpen] = useState(false)

  const getTokenImage = (imageName: string) => {
    const tokenImages = new TokenImages();
    return tokenImages.getBase64Image(imageName);
  };

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data)
    })
  }

  const getTokens = () => {
    tokenService.getTokens().then((data) => {
      setTokens(data)
    })
  }

  useEffect(() => {
    getNetwork()

    setTimeout(() => {
      getTokens()
    }, 100)
  }, [])

  const TokenDetailClick = (data) => {
    setIsTokenDetailDrawerOpen(true)
    setSelectedToken(data)
  }

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      Promise.all([walletService.getWallets(), tokenService.getTokens()])
        .then(([walletData, tokenData]) => {
          setWallets(walletData);
          setTokens(tokenData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    fetchData();
  }, []);  
  
  useEffect(() => {
    if (selectedNetwork) {
      console.log("Fetching balance for wallet:", value, "and token:", selectedToken.symbol);
    
      if (value && selectedToken.symbol) {
        balanceService
          .getBalance(selectedNetwork.name, value)
          .then((balance) => {
            console.log("Fetched balance:", balance);
            const tokenBalance = balance.find(
              (balanceItem) => balanceItem.symbol === selectedToken.symbol
            );
            setBalanceData(tokenBalance || null);
          })
          .catch((error) => {
            console.error("Error fetching balance:", error);
          });
      } else {
        console.log("Missing value or selected token.");
      }
    }
  }, [value, selectedToken, selectedNetwork]);

  return (
    <div className="py-4">
      {isLoading ? (
        <div className="text-center text-lg font-semibold">Loading...</div>
      ) : (
        <>
          <Label className="text-base mb-2">Address:</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="roundedOutline"
                role="combobox"
                aria-expanded={open}
                className="w-full mb-3 justify-between text-input-primary p-3"
                size="lg">
                {value ? (
                  <>
                    {wallets.find((wallet) => wallet.public_key === value)?.name}{" "}
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
            <PopoverContent 
              className="p-0 w-full max-w-none"  
              align="start"
              sideOffset={4}
              style={{ width: "var(--radix-popper-anchor-width)" }}
            >
              <Command>
                <CommandInput placeholder="Search address..." className="h-9 " />
                <CommandList>
                  <CommandEmpty>No address found.</CommandEmpty>
                  <CommandGroup>
                    {wallets
                     .filter(
                      (wallet) =>
                        wallet.address_type ===
                        (selectedNetwork ? selectedNetwork.name : "")
                    )
                     .map((wallet) => (
                      <CommandItem
                        key={wallet.public_key}
                        value={wallet.public_key}
                        onSelect={(currentValue) => {
                          console.log("Wallet selected:", currentValue);
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                        }}>
                        <div className="flex flex-col text-input-primary">
                          <span>
                            {wallet.name} {"{"}
                            {wallet.public_key.slice(0, 6)}...{wallet.public_key.slice(-6)}
                            {"}"}
                          </span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto",
                            value === wallet.public_key ? "opacity-100" : "opacity-0"
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
                {tokens
                  .filter(
                    (token) =>
                      (token.type === "Native" || token.type === "Asset") &&
                      token.network === (selectedNetwork ? selectedNetwork.name : "")
                  )
                  .sort((a, b) => {
                    if (a.type === "Native" && b.type !== "Native") return -1;
                    if (a.type !== "Native" && b.type === "Native") return 1;
                    return 0;
                  })
                  .map((token) => (
                    <TableRow
                      key={token.symbol}
                      onClick={() => TokenDetailClick(token)}
                      className="cursor-pointer hover-bg-custom">
                      <TableCell className="w-[50px] justify-center">
                        <Image
                          src={getTokenImage(token.image_url)}
                          width={40}
                          height={40}
                          alt={token.symbol}
                          className="ml-1"
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
                          {balanceData ? balanceData.balance : "1"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <IndexTokenDetails
              isDrawerOpen={isTokenDetailDrawerOpen}
              toggleDrawer={() => setIsTokenDetailDrawerOpen(!isTokenDetailDrawerOpen)}
              selectedToken={{
                ...selectedToken,
                owner: balanceData ? balanceData.owner : "",
                balance: balanceData ? balanceData.balance : "1",
                reserveBalance: balanceData
                  ? balanceData.reserveBalance
                  : "0",
                is_frozen: balanceData
                  ? typeof balanceData.is_frozen === "boolean"
                    ? balanceData.is_frozen
                    : false
                  : false,
              }}
              walletPublicKey={value}
              handleCallbacks={function (): void {
                throw new Error("Function not implemented.");
              }} 
            />
          </Card>
        </>
      )}
    </div>
  )
}

export default IndexBalance
