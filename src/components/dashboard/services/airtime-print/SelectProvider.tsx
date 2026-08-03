import { useNavigate } from "react-router-dom";
import BackButton from "@/components/Authentication/BackButton";
import CustomButton from "@/components/CustomButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import useAirtimePrintStore from "@/stores/useAirtimePrintStore";
import { NetworkProvidersDropdown } from "@/lib/constants";
import { useState } from "react";

const SelectProvider = () => {
    const navigate = useNavigate();
    const { network, denomination, quantity, update, step } = useAirtimePrintStore();
    const [showProvidersDropdown, setShowProvidersDropdown] = useState(false);
    const [showDenomDropdown, setShowDenomDropdown] = useState(false);

    const selectedProvider = NetworkProvidersDropdown.find(p => p.value === network);
    const denominations = [100, 200, 500];

    const increment = () => {
        if (quantity < 100) update({ quantity: quantity + 1 });
    };

    const decrement = () => {
        if (quantity > 1) update({ quantity: quantity - 1 });
    };

    return (
        <section className="w-full max-w-[360px] mx-auto">
            <div className="flex items-center mb-10 mt-2 md:hidden fixed top-2 w-full max-w-[360px] mx-auto right-0 left-0 z-10 backdrop-blur-[2px] px-5">
                <BackButton icon action={() => navigate(-1)} />
                <p className="text-[#667085] font-medium text-xl w-full text-center mr-6">Airtime Print</p>
            </div>

            <div className="max-md:hidden">
                <BackButton className="mb-8" action={() => navigate(-1)} />
                <h1 className="font-medium text-2xl text-[var(--aqua)] ">Airtime Print</h1>
                <h2 className=" text-[#717171]">Print airtime pins directly.</h2>
            </div>

            <div className="w-full mt-14 md:mt-8 flex flex-col gap-5">
                {/* Network Selection */}
                <div className="w-full">
                    <label className="text-sm text-[#344054] font-medium" htmlFor="network">Select network</label>
                    <Popover open={showProvidersDropdown} onOpenChange={setShowProvidersDropdown}>
                        <PopoverTrigger asChild>
                            <CustomButton
                                aria-expanded={showProvidersDropdown}
                                className="w-full !h-12 mt-1.5 border-[0.5px] border-[#D0D5DD] rounded-lg py-2.5 px-3.5 bg-white outline-none hover:border-[var(--aqua)] font-normal text-[#667085] flex items-center justify-between text-sm"
                            >
                                {selectedProvider
                                    ? <div className="text-[#344054] flex items-center gap-2">
                                            <img src={selectedProvider.logo} className="size-5 object-cover" />
                                            <span>{selectedProvider.label}</span>
                                        </div>
                                    : "Select network provider"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </CustomButton>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[90vw] md:w-[360px]">
                            <Command>
                                <CommandInput placeholder="search..." />
                                <CommandList className="w-full px-3.5">
                                    <CommandEmpty>No providers found.</CommandEmpty>
                                    <CommandGroup className="px-0">
                                    {NetworkProvidersDropdown.map((prov) => (
                                        <CommandItem
                                            className={cn("text-[#344054] justify-between", selectedProvider?.value === prov.value && "font-medium")}
                                            key={prov.value}
                                            value={prov.value}
                                            onSelect={(currentValue) => {
                                                update({ network: currentValue === network ? "" : currentValue });
                                                setShowProvidersDropdown(false);
                                            }}
                                        >
                                        <div className="text-[#344054] flex items-center gap-2">
                                            <img src={prov.logo} className="size-5 object-cover" />
                                            <span>{prov.label}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            network === prov.value ? "opacity-100" : "opacity-0"
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

                {/* Denomination Selection */}
                <div className="w-full">
                    <label className="text-sm text-[#344054] font-medium" htmlFor="denomination">Select denomination</label>
                    <Popover open={showDenomDropdown} onOpenChange={setShowDenomDropdown}>
                        <PopoverTrigger asChild>
                            <CustomButton
                                aria-expanded={showDenomDropdown}
                                className="w-full !h-12 mt-1.5 border-[0.5px] border-[#D0D5DD] rounded-lg py-2.5 px-3.5 bg-white outline-none hover:border-[var(--aqua)] font-normal text-[#667085] flex items-center justify-between text-sm"
                            >
                                {denomination ? `₦${denomination}` : "Select denomination"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </CustomButton>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[90vw] md:w-[360px]">
                            <Command>
                                <CommandList className="w-full px-3.5">
                                    <CommandGroup className="px-0">
                                    {denominations.map((denom) => (
                                        <CommandItem
                                            className={cn("text-[#344054] justify-between", denomination === denom && "font-medium")}
                                            key={denom}
                                            value={denom.toString()}
                                            onSelect={() => {
                                                update({ denomination: denom });
                                                setShowDenomDropdown(false);
                                            }}
                                        >
                                        <span>₦{denom}</span>
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            denomination === denom ? "opacity-100" : "opacity-0"
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

                {/* Quantity Selection */}
                <div className="w-full">
                    <label className="text-sm text-[#344054] font-medium">Quantity</label>
                    <div className="flex items-center justify-between border-[0.5px] border-[#D0D5DD] rounded-lg p-1.5 mt-1.5 h-12">
                        <button onClick={decrement} className="size-8 grid place-items-center bg-slate-100 rounded-md hover:bg-slate-200">
                            <Minus className="size-4" />
                        </button>
                        <span className="font-semibold">{quantity}</span>
                        <button onClick={increment} className="size-8 grid place-items-center bg-slate-100 rounded-md hover:bg-slate-200">
                            <Plus className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Total Cost Display */}
                {denomination && quantity && (
                    <div className="w-full p-4 bg-slate-50 rounded-xl mt-2 flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-medium">Total Cost:</span>
                        <span className="text-lg font-bold text-[var(--aqua)]">₦{(denomination * quantity).toLocaleString()}</span>
                    </div>
                )}

                <CustomButton 
                    onClick={() => update({ step: step + 1 })} 
                    disabled={!network || !denomination || !quantity} 
                    className="w-full mt-2"
                >
                    Proceed
                </CustomButton>
            </div>
        </section>
    );
};

export default SelectProvider;
