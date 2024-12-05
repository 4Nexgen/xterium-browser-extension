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
import Image from "next/image";
import XONLogo from "data-base64:/assets/tokens/xon.png";

const networks = [
  { value: "Mainnet", label: "Mainnet" },
];

interface HeaderProps {
  currentPage?: string;
  onSetCurrentPage?: (page: string) => void;
  variant?: "default" | "create-password" | "login"; 
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSetCurrentPage,
  variant = "default",
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { theme } = useTheme();

  if (variant === "create-password") {
    return (
      <header 
        className="flex justify-between items-center h-16 px-4 " 
        style={{
            background: "#2E266D",
        }}
      >
        <h1 className="text-base font-semibold tracking-[0.15em]">Setup Password</h1>
        <div className="w-[200px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full float-right"
                size="lg"
              >
                {value && (
                  <div className="w-5 h-5 mr-2 relative">
                    <Image
                      src={XONLogo}
                      alt="XON Logo"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                )}
                {value
                  ? networks.find((network) => network.value === value)?.label
                  : "Select network"}
                <ChevronsUpDown className="opacity-50 ml-2" />
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
  }

  else if (variant === "login") {
    return (
      <header 
        className="flex justify-between items-center h-16 px-4 " 
        style={{
            background: "#2E266D",
        }}
      >
        <h1 className="text-base font-semibold tracking-[0.15em]">Login</h1>
        <div className="w-[200px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full float-right"
                size="lg"
              >
                {value && (
                  <div className="w-5 h-5 mr-2 relative">
                    <Image
                      src={XONLogo}
                      alt="XON Logo"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                )}
                {value
                  ? networks.find((network) => network.value === value)?.label
                  : "Select network"}
                <ChevronsUpDown className="opacity-50 ml-2" />
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
  }

  return (
    <header className="flex top-0 h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="p-2 rounded" />
      <Separator
        orientation="vertical"
        className={`mr-2 h-4 ${theme === "light" ? "" : "bg-white"}`}
      />
      <Breadcrumb className="w-full tracking-[0.15em]">
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
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full float-right"
              size="lg"
            >
              {value && (
                <div className="w-5 h-5 mr-2 relative">
                  <Image
                    src={XONLogo}
                    alt="XON Logo"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              )}
              {value
                ? networks.find((network) => network.value === value)?.label
                : "Select network"}
              <ChevronsUpDown className="opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px]">
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
