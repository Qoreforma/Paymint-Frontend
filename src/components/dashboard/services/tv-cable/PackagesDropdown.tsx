import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
  
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  
import { cn } from "@/lib/utils";
import useTVCableStore from "@/stores/useTVCableStore";
import { TvProductType } from "./RecipientDetails";

type TPackagesDropdown = {
    packagesArr: TvProductType[] | undefined;
    isLoading: boolean;
    disable?: boolean;
    error: boolean;
}

const PackagesDropdown = ({packagesArr,isLoading, disable, error}: TPackagesDropdown) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const {package: selectedPackage, update, provider} = useTVCableStore();

    useEffect(() => {
        update({ package: null });
    }, [provider, update]);

  return (
    <div className="w-full">
        <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="package">Select package</label>
        <Popover open={showDropdown} onOpenChange={setShowDropdown}>
            <PopoverTrigger asChild>
                <button
                    disabled={disable || isLoading}
                    aria-expanded={showDropdown}
                    className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-semibold text-slate-800 transition-all shadow-sm flex items-center justify-between text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {selectedPackage
                        ? <div className="flex items-center gap-2">
                            <img src={selectedPackage?.logo} className="size-6 object-cover rounded-sm" />
                            <span>{selectedPackage?.name} - {selectedPackage.validity}</span>
                        </div>
                        : <span className="text-slate-500 font-normal">{isLoading ? "Loading packages..." : "Select package"}</span>}
                    <ChevronDown className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[90vw] md:w-[360px]">
                <Command className="">
                    <CommandInput className="" placeholder="search..." />
                    <CommandList className="w-full px-3.5">
                        <CommandEmpty>No pckg found.</CommandEmpty>
                        <CommandGroup className="px-0">
                        {packagesArr && packagesArr.length && packagesArr.map((pckg) => (
                            <CommandItem
                                className={cn("text-[#344054] justify-between", selectedPackage && pckg.code === selectedPackage.code && "font-medium")}
                                key={pckg.id}
                                value={pckg.code}
                                onSelect={(currentValue) => {
                                    const cablePackage = packagesArr.find((pkg) => pkg.code === currentValue)
                                    update(currentValue === selectedPackage?.code ? {package: null} : {package: cablePackage})

                                    setShowDropdown(false)
                                }}
                            >
                                <div className="text-[#344054] flex items-center gap-2">
                                    <img src={pckg.logo} className="size-5 object-cover" />
                                    <span>{pckg.name} - {pckg.validity}</span>
                                </div>
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedPackage?.code === pckg.code ? "opacity-100" : "opacity-0"
                                    )}
                            />
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
        {error && <p className="text-red-500 text-sm mt-1">Failed to fetch packages, please refresh.</p>}
    </div>
  )
}

export default PackagesDropdown