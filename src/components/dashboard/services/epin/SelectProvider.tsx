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

import { Check, ChevronDown, Loader2 } from "lucide-react";
import useEpinStore from "@/stores/useEPinStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEpinProviders, getEpinProducts, verifyJambNumber } from "@/lib/api/dashboard-apis/servicesApis";
import { AnimatePresence, motion } from "framer-motion";
import { BsCheck2Circle } from "react-icons/bs";
import { AxiosError } from "axios";
import NetworkProviderPicker from "../shared/NetworkProviderPicker";



export type EpinProviderType = {
    id: number,
    name: string,
    code: string,
    logo: string
}

export type EpinProductType = {
    id: number,
    name: string,
    code: string,
    amount: number,
    logo: string

}

export type VerifyJambNoPayload = {number: string, type?: string}
type JambNoNoVerificationResponse = {valid: boolean, customerName: string, registrationNumber: string}

const Selectcategory = () => {
    const [showProductsDropdown, setShowProductsDropdown] = useState(false);

    const {selectedProvider, selectedProduct, examNumber, update, step} = useEpinStore();

    const {mutate, isPending: isVerifying, data: verifiedJambNumber, error: verifyError} = useMutation<JambNoNoVerificationResponse, AxiosError, VerifyJambNoPayload>({
        mutationFn: verifyJambNumber,
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (error: AxiosError) => {
            console.log({error})
        }
    })

    let verifyErrData: { message?: string } | undefined;
    if (verifyError?.response?.data) {
        verifyErrData = verifyError.response.data;
    }

    const {
        data: providers,
        isLoading: fetchingProviders,
    } = useQuery<EpinProviderType[], Error>({
        queryKey: ["epin-providers"],
        queryFn: fetchEpinProviders,
    })

    const {
        data: EpinProducts,
        isLoading: fetchingProducts,
        isError: fetchProductsError,
        } = useQuery<EpinProductType[], Error, EpinProductType[], [string, number]>({
        queryKey: ['epin-products', selectedProvider?.id as number],
        queryFn: getEpinProducts,
        enabled: !!selectedProvider
    });

    useEffect(() => {
        update({ selectedProduct: null });
    }, [selectedProvider, update]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
        if(examNumber && examNumber.length >= 10 && selectedProvider ){
            mutate({type: "utme", number: examNumber})
        }
        }, 1000);
    
        return () => clearTimeout(delayDebounce)
    }, [mutate, selectedProvider, examNumber])

    useEffect(() => {
        update({ selectedProduct: null });
    }, [selectedProvider, update]);

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" />
                   </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Select Category</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Please select the category you are buying from</p>
                </div>
            </div>

            <div className="w-full flex flex-col gap-8">
                <NetworkProviderPicker
                    label="E-Pin Provider"
                    providers={providers?.map(p => ({id: String(p.id), name: p.name, code: p.code, logo: p.logo})) || []}
                    isLoading={fetchingProviders}
                    selectedProviderCode={selectedProvider?.code || null}
                    onSelect={(code) => {
                        const found = providers?.find((p) => p.code === code);
                        update({ selectedProvider: found || null, selectedProduct: null });
                    }}
                />
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="package">Select product</label>
                <Popover open={showProductsDropdown} onOpenChange={setShowProductsDropdown}>
                    <PopoverTrigger asChild>
                        <button
                            disabled={!selectedProvider || fetchingProducts}
                            aria-expanded={showProductsDropdown}
                            className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-semibold text-slate-800 transition-all shadow-sm flex items-center justify-between text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {selectedProduct
                                ? <div className="flex items-center gap-2">
                                    <img src={selectedProduct.logo} className="size-6 object-cover rounded-sm" />
                                    <span className="text-left line-clamp-1">{selectedProduct.name}</span>
                                </div>
                                : <span className="text-slate-500 font-normal">{fetchingProducts ? "Loading products..." : "Select product"}</span>}
                            <ChevronDown className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[90vw] md:w-[360px]">
                        <Command className="">
                            <CommandInput className="" placeholder="search..." />
                            <CommandList className="w-full px-3.5">
                                <CommandEmpty>No pckg found.</CommandEmpty>
                                <CommandGroup className="px-0">
                                {EpinProducts && EpinProducts.length && EpinProducts.map((pckg) => (
                                    <CommandItem
                                        className={cn("text-[#344054] justify-between", selectedProduct && pckg === selectedProduct && "font-medium")}
                                        key={pckg.id}
                                        value={pckg.code}
                                        onSelect={(currentValue) => {
                                            const epinProduct = EpinProducts.find((pkg) => pkg.code === currentValue)
                                            update(currentValue === selectedProduct?.code ? {selectedProduct: null} : {selectedProduct: epinProduct})

                                            setShowProductsDropdown(false)
                                        }}
                                    >
                                        <div className="text-[#344054] flex items-center gap-2">
                                            <img src={pckg.logo} className="size-5 object-cover" />
                                            <span>{pckg.name}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedProduct?.code === pckg.code ? "opacity-100" : "opacity-0"
                                            )}
                                    />
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {fetchProductsError && <p className="text-red-500 text-sm mt-1">Failed to fetch products, please refresh.</p>}
            </div>
            <AnimatePresence>                
                {(selectedProvider?.code === "jamb" || selectedProduct?.code === "de") && (
                <motion.div
                    initial={{height:0}}
                    animate={{height: "auto"}}
                    exit={{height:0}}
                    className="w-full overflow-y-hidden">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="user">Exam number</label>
                    <input value={examNumber} onChange={(e) => update({examNumber: e.target.value})} placeholder="Enter exam number" className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm" type="text" id="examNumber" />
                    {
                        (!isVerifying && verifyErrData ) && <p className="text-red-500 text-sm mt-1">{verifyErrData?.message}</p>
                    }
                    
                    {isVerifying && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex items-center gap-2 mt-2"><Loader2 className="animate-spin size-4 text-blue-600" /> <span className="italic text-sm text-slate-500">Verifying jamb number</span></motion.div>}
                    {
                        verifiedJambNumber && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex mt-2 items-center gap-2">
                            <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white"><BsCheck2Circle className="size-3" /> </div>
                            <p className="text-sm font-medium text-green-600">{verifiedJambNumber.customerName}</p>
                        </motion.div>
                    }
                </motion.div>)}
            </AnimatePresence>
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="amount">Amount</label>
                <div className="w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">₦</span>
                    <input 
                        disabled 
                        value={selectedProduct?.amount || ''} 
                        className="w-full border border-slate-200 rounded-2xl py-4 pl-10 pr-4 bg-slate-50 outline-none placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm opacity-70 cursor-not-allowed" 
                        id="amount" 
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={() => update({step: step+1})} 
                disabled={(selectedProvider?.code === "jamb" ? (!selectedProvider || !selectedProduct || !examNumber || !verifiedJambNumber) : (!selectedProvider || !selectedProduct))}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
                Proceed to Confirm Purchase
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </div>
    </section>
  )
}

export default Selectcategory