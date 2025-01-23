import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { NetworkModel } from "@/models/network.model";
import type { PumpTokenWithAssetDetails } from "@/models/pump-token.model"; // Use the new interface
import { NetworkService } from "@/services/network.service";
import { PumpTokenService } from "@/services/pump-token.service";
import { Search, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import IndexPumpTokenDetails from "./pump-token-details";

const truncateText = (text, limit) => {
  return text && text.length > limit ? `${text.slice(0, limit)}...` : text || ""; // Ensure text is defined
};

const IndexPumpToken = () => {
  const { t } = useTranslation();
  const networkService = new NetworkService();
  const pumpTokenService = new PumpTokenService();

  const [openSearchToken, setOpenSearchTokens] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPumpTokenDetailsDrawerOpen, setIsPumpTokenDetailsDrawerOpen] = useState(false);
  const [selectedInSearchToken, setSelectedInSearchToken] = useState<PumpTokenWithAssetDetails | null>(null);
  const [pumpTokens, setPumpTokens] = useState<PumpTokenWithAssetDetails[]>([]);
  const [assetDetails, setAssetDetails] = useState<any[]>([]); // Store asset details
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkModel | null>(null); // Define selected network
  const [loading, setLoading] = useState<boolean>(true); 

  const getNetwork = () => {
    networkService.getNetwork().then((data) => {
      setSelectedNetwork(data);
    });
  };

  const getPumpTokens = () => {
    setLoading(true);
    pumpTokenService.getPumpTokens().then((data) => {
      setPumpTokens(data);
      data.forEach((token) => {
        if (token.network_id) {
          fetchAssetDetails(token.network_id);
        }
      });
      setLoading(false);
    });
  };

  const fetchAssetDetails = async (assetId) => {
    try {
      const details = await pumpTokenService.getAssetDetails(assetId);
      setAssetDetails((prevDetails) => [...prevDetails, details]); 
    } catch (error) {
      console.error("Failed to fetch asset details:", error);
    }
  };

  useEffect(() => {
    getNetwork();
    getPumpTokens();
  }, []);

  const handleTokenClick = (token: PumpTokenWithAssetDetails) => {
    setSelectedInSearchToken(token);
    setIsPumpTokenDetailsDrawerOpen(true);
  };

  const filteredTokens = pumpTokens
  .map((token) => {
    const assetDetail = assetDetails.find(
      (detail) => detail.assetId.toString() === token.network_id
    );
    return {
      ...token,
      assetDetail: assetDetail || null,
    };
  })
  .filter(
    (token) =>
      token.assetDetail &&
      (searchQuery === "" ||
        token.assetDetail.name.toLowerCase().startsWith(searchQuery.toLowerCase())) 
  );

  const formatCurrency = (amount) => {
    if (!amount) return "$0.0";
    const num = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(num)) return "$0.0";

    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}k`;
    }
    return `$${num.toFixed(1)}`;
  };

  return (
    <>
      <div className="py-4 flex flex-col justify-between h-full">
        <div className="py-4">
          <div className="mb-3">
            <Label className="font-bold text-muted">{t("Search")}</Label>
            <Popover open={openSearchToken} onOpenChange={setOpenSearchTokens}>
              <PopoverTrigger asChild>
                <Button
                  variant="roundedOutline"
                  role="combobox"
                  aria-expanded={openSearchToken}
                  className="w-full justify-between text-input-primary p-3 font-bold hover:bg-accent"
                  size="lg">
                  {searchQuery ? (
                    <span className="text-muted">{searchQuery}</span> // Display the current search query
                  ) : (
                    <span className="text-muted opacity-70">{t("Search for Tokens")}</span>
                  )}
                  <Search />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popper-anchor-width)" }}>
                <Command>
                  <CommandInput
                    placeholder={t("Enter Token Name")}
                    value={searchQuery}
                    onValueChange={(value) => {
                      setSearchQuery(value);
                      if (value === "") {
                        setSelectedInSearchToken(null); 
                      }
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>{t("No results found.")}</CommandEmpty>
                    <CommandGroup>
                      {filteredTokens.map((token) => (
                        <CommandItem
                          key={token.id}
                          value={token.assetDetail?.name || ""}
                          onSelect={() => {
                            setSearchQuery(token.assetDetail?.name || ""); 
                            setSelectedInSearchToken(token); 
                            setOpenSearchTokens(false);
                          }}
                          className="cursor-pointer hover:bg-accent">
                          {token.assetDetail?.name || t("No Name Available")}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex grid grid-cols-2 sm:grid-cols-2 gap-4">
            {loading ? ( 
              <div className="flex justify-center items-center w-full h-36">
                <Loader className="animate-spin h-6 w-6 text-muted" />
                <p className="text-muted ml-2">{t("Loading tokens...")}</p>
              </div>
            ) : (
              filteredTokens.map((token) => (
              <div
                key={token.id}
                className="flex flex-col items-start justify-between border-2 border-primary dark:border-border dark:bg-muted/50 rounded-xl h-full"
                onClick={() => handleTokenClick(token)}>
                <div className="w-full flex justify-center mb-4">
                  <img
                    src={token.image_url}
                    alt={token.assetDetail?.name || "Token Image"}
                    className="h-36 w-full object-cover object-center rounded-lg"
                  />
                </div>
                <h3 className="font-bold text-sm pl-2">
                  {token.assetDetail?.name || "No Name Available"} ({token.assetDetail?.symbol || "N/A"})
                </h3>
                <p className="pl-2 mt-1">
                  Created by:{" "}
                  <span className="text-muted p-4 underline">
                    {token.assetDetail?.owner
                      ? `${token.assetDetail.owner.slice(0, 4)}...${token.assetDetail.owner.slice(-4)}`
                      : "Unknown"}
                  </span>
                </p>
                <p className="pl-2 pr-2 opacity-50 leading-snug mt-1 mb-1">
                  {truncateText(token.description, 50)}
                </p>
                <p>
                  <span className="opacity-50 pl-2">Market Cap:</span>
                  <span className="font-bold p-4">
                    {formatCurrency(token.assetDetail?.marketCap)}
                  </span>
                </p>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
      <Drawer
        open={isPumpTokenDetailsDrawerOpen}
        onOpenChange={setIsPumpTokenDetailsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="border-b border-border-1/20 pb-4 text-muted">
              {selectedInSearchToken
                ? `${selectedInSearchToken.assetDetail?.name} (${selectedInSearchToken.assetDetail?.symbol})`
                : "Loading..."}
            </DrawerTitle>
          </DrawerHeader>
          {selectedInSearchToken ? (
            <IndexPumpTokenDetails
              selectedPumpTokens={selectedInSearchToken}
              handleCallbacks={() => {}}
              owner={selectedInSearchToken.assetDetail?.owner}
              minBalance={selectedInSearchToken.assetDetail.minBalance}
              supply={selectedInSearchToken.assetDetail.supply}
            />
          ) : (
            <p>{t("Loading...")}</p>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default IndexPumpToken;