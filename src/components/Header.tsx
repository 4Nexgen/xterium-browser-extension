import React, { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTheme } from "next-themes";
import XONLogo from "data-base64:/assets/tokens/xon.png";

const networks = [
  { value: "Mainnet", label: "Mainnet" },
  { value: "Testnet", label: "Testnet" },
];

interface HeaderProps {
  currentPage: string;
  onSetCurrentPage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onSetCurrentPage }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { theme } = useTheme();

  return (
    <header className="flex top-0 h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="p-2" />
      <Separator
        orientation="vertical"
        className={`mr-2 h-4 ${
          theme === "light" ? "" : "bg-white"
        }`}
      />
      <Breadcrumb className="w-full">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              <b>{currentPage}</b>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-[200px]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="roundedOutline"
              role="combobox"
              aria-expanded={open}
              className="w-full float-right"
              size="lg"
            >
              <img src={XONLogo} className="w-2/12" alt="XON Logo" />{" "}
              {value
                ? networks.find((network) => network.value === value)?.label
                : "Select network"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0">
            <Command>
              <CommandInput placeholder="Search network..." className="h-9" />
              <CommandList>
                <CommandEmpty>No network found.</CommandEmpty>
                <CommandGroup>
                  {networks.map((network) => (
                    <CommandItem
                      key={network.value}
                      value={network.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      {network.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === network.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default Header;
