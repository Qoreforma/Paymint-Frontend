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
import useDataPrintStore from "@/stores/useDataPrintStore";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDataProviders, fetchDataEpinProducts } from "@/lib/api/dashboard-apis/servicesApis";

const SelectProvider = () => {
    const navigate = useNavigate();
    const { selectedProvider, selectedProduct, quantity, update, step } = useDataPrintStore();
    const [showProvidersDropdown, setShowProvidersDropdown] = useState(false);
    const [showProductsDropdown, setShowProductsDropdown] = useState(false);

    const { data: providers, isLoading: fetchingProviders } = useQuery({
        queryKey: ["data-providers"],
        queryFn: fetchDataProviders,
    });

    const { data: products, isLoading: fetchingProducts } = useQuery<any[], Error>({
        queryKey: ["data-epin-products", String(selectedProvider?.id)],
        queryFn: fetchDataEpinProducts,
        enabled: !!selectedProvider?.id
    });

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
                <p className="text-[#667085] font-medium text-xl w-full text-center mr-6">Data Print</p>
            </div>

            <div className="max-md:hidden">
                <BackButton className="mb-8" action={() => navigate(-1)} />
                <h1 className="font-medium text-2xl text-[var(--aqua)] ">Data Print</h1>
                <h2 className=" text-[#717171]">Print data pins directly.</h2>
            </div>

            <div className="w-full mt-14 md:mt-8 flex flex-col gap-5">
                {/* Network Selection */}
                <div className="w-full">
                    <label className="text-sm text-[#344054] font-medium">Select network</label>
                    <Popover open={showProvidersDropdown} onOpenChange={setShowProvidersDropdown}>
                        <PopoverTrigger asChild>
                            <CustomButton
                                disabled={fetchingProviders}
                                aria-expanded={showProvidersDropdown}
                                className="w-full !h-12 mt-1.5 border-[0.5px] border-[#D0D5DD] rounded-lg py-2.5 px-3.5 bg-white outline-none hover:border-[var(--aqua)] font-normal text-[#667085] flex items-center justify-between text-sm"
                            >
                                {selectedProvider
                                    ? <div className="text-[#344054] flex items-center gap-2">
                                            <img src={selectedProvider.logo} className="size-5 object-cover" />
                                            <span>{selectedProvider.name}</span>
                                        </div>
                                    : (fetchingProviders ? "Loading..." : "Select network provider")}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </CustomButton>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[90vw] md:w-[360px]">
                            <Command>
                                <CommandInput placeholder="search..." />
                                <CommandList className="w-full px-3.5">
                                    <CommandEmpty>No providers found.</CommandEmpty>
                                    <CommandGroup className="px-0">
                                    {providers && providers.map((prov: any) => (
                                        <CommandItem
                                            className={cn("text-[#344054] justify-between", selectedProvider?.id === prov.id && "font-medium")}
                                            key={prov.id}
                                            value={prov.code}
                                            onSelect={() => {
                                                update({ selectedProvider: prov, selectedProduct: null });
                                                setShowProvidersDropdown(false);
                                            }}
                                        >
                                        <div className="text-[#344054] flex items-center gap-2">
                                            <img src={prov.logo} className="size-5 object-cover" />
                                            <span>{prov.name}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedProvider?.id === prov.id ? "opacity-100" : "opacity-0"
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

                {/* Product Selection */}
                <div className="w-full">
                    <label className="text-sm text-[#344054] font-medium">Select data plan</label>
                    <Popover open={showProductsDropdown} onOpenChange={setShowProductsDropdown}>
                        <PopoverTrigger asChild>
                            <CustomButton
                                disabled={!selectedProvider || fetchingProducts}
                                aria-expanded={showProductsDropdown}
                                className="w-full !h-12 mt-1.5 border-[0.5px] border-[#D0D5DD] rounded-lg py-2.5 px-3.5 bg-white outline-none hover:border-[var(--aqua)] font-normal text-[#667085] flex items-center justify-between text-sm"
                            >
                                {selectedProduct
                                    ? <div className="text-[#344054] flex items-center gap-2">
                                            {selectedProduct.logo && <img src={selectedProduct.logo} className="size-5 object-cover" />}
                                            <span className="line-clamp-1 text-left">{selectedProduct.name}</span>
                                        </div>
                                    : (fetchingProducts ? "Loading plans..." : "Select data plan")}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </CustomButton>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[90vw] md:w-[360px]">
                            <Command>
                                <CommandInput placeholder="search..." />
                                <CommandList className="w-full px-3.5">
                                    <CommandEmpty>No plans found.</CommandEmpty>
                                    <CommandGroup className="px-0">
                                    {Array.isArray(products) && products.map((prod: any) => (
                                        <CommandItem
                                            className={cn("text-[#344054] justify-between", selectedProduct?.id === prod.id && "font-medium")}
                                            key={prod.id}
                                            value={prod.name}
                                            onSelect={() => {
                                                update({ selectedProduct: prod });
                                                setShowProductsDropdown(false);
                                            }}
                                        >
                                        <div className="text-[#344054] flex items-center gap-2">
                                            {prod.logo && <img src={prod.logo} className="size-5 object-cover" />}
                                            <span>{prod.name} - ₦{prod.amount}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedProduct?.id === prod.id ? "opacity-100" : "opacity-0"
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
                {selectedProduct && quantity && (
                    <div className="w-full p-4 bg-slate-50 rounded-xl mt-2 flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-medium">Total Cost:</span>
                        <span className="text-lg font-bold text-[var(--aqua)]">₦{(selectedProduct.amount * quantity).toLocaleString()}</span>
                    </div>
                )}

                <CustomButton 
                    onClick={() => update({ step: step + 1 })} 
                    disabled={!selectedProvider || !selectedProduct || !quantity} 
                    className="w-full mt-2"
                >
                    Proceed
                </CustomButton>
            </div>
        </section>
    );
};

export default SelectProvider;
