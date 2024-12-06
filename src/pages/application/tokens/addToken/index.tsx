import React, {useState, useMemo} from "react";
import { 
    Drawer, 
    DrawerContent, 
    DrawerHeader, 
    DrawerTitle, 
    DrawerDescription 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from "@/components/ui/popover";
import { token_data } from "@/data/token.data";
import { ChevronsUpDown } from "lucide-react";
import { Token } from "@/models/token.model";

interface IndexAddTokenProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const IndexAddToken: React.FC<IndexAddTokenProps> = ({
    isDrawerOpen,
    toggleDrawer,
  }) => {
    const [open, setOpen] = useState(false);
    const [tokenType, setTokenType] = useState("");
    const [filteredTokenTypes, setFilteredTokenTypes] = useState<string[]>([]);
  
    const uniqueTypes = useMemo(() => {
      const types = token_data.map((token) => token.type);
      return Array.from(new Set(types));
    }, []);

    const handleTypeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setTokenType(value);
  
      setFilteredTokenTypes(
        uniqueTypes.filter((type) =>
          type.toLowerCase().includes(value.toLowerCase())
        )
      );
    };
  
    const handleSelectType = (type: string) => {
      setTokenType(type);
      setOpen(false); 
    };
  
    return (
    <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            ADD NEW TOKEN
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          <div className="p-6">
              <div className="mb-3">
                <Label>
                  Token Type
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="roundedOutline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full mb-3 justify-between text-label-color"
                    size="lg"
                  >
                    {tokenType || "Select Token Type"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-[400px] w-[400px] p-1">
                  <Input
                    type="text"
                    placeholder="Type or select a token type"
                    value={tokenType}
                    onChange={handleTypeInput}
                    className="mb-2"
                  />
                  <ul>
                    {filteredTokenTypes.length > 0 ? (
                      filteredTokenTypes.map((type, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectType(type)}
                          className="p-2 cursor-pointer text-label-color hover-bg-custom"
                        >
                          {type}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-gray-500">No options found</li>
                    )}
                  </ul>
                </PopoverContent>
              </Popover>
              </div>
              <div className="mb-3">
                <Label>
                  Network:
                </Label>
                <Input
                  type="text"
                  placeholder="Enter Network"
                />
              </div>
              <div className="mb-3">
                <Label>
                  Network Id {"(0 if Native)"}:
                </Label>
                <Input
                  type="text"
                  placeholder="Enter Network"
                />
              </div>
              <div className="mb-3">
                <Label>
                  Symbol:
                </Label>
                <Input
                  type="text"
                  placeholder="Enter Symbol"
                />
              </div>
              <div className="mb-3">
                <Label>
                  Description:
                </Label>
                <Input
                  type="text"
                  placeholder="Enter Description"
                />
              </div>
              <Button
                type="button"
                variant="violet"
                >
                SAVE
              </Button>
          </div>
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
};
export default IndexAddToken;