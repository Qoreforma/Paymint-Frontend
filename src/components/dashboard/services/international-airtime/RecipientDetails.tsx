import {  IntAirtimeRecipientDetailFormSchema } from "@/lib/zodSchemas/dashboard.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import {useState } from "react"
import { Controller, useForm } from "react-hook-form"
import PhoneInput from "react-phone-input-2"
import { z } from "zod"

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
  PopoverTrigger
} from "@/components/ui/popover"

import { Check, ChevronDown } from "lucide-react"


import { cn, convertToLocalPhoneNumber } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { fetchIntAirtimeProviders, fetchIntCountries } from "@/lib/api/dashboard-apis/servicesApis"
import usePurchaseIntAirtimeStore from "@/stores/usePurchaseIntAirtimeStore"
import NetworkProviderPicker from "../shared/NetworkProviderPicker"

export type VerifyPhoneNoPayload = {phone: string; network: string};
export type phoneNoVerificationResponse = {
    isValid: boolean;
};

export type TIntCountry = {
  iso2: string;
  name: string;
  flag: string;
  iso3: string;
  phoneCode: string;
  currencyCode: string;
  currencySymbol: string;
  callingCodes: string[];
};

export type AirtimeProviderType = {
  operatorId: number;
  name: string;
  country: {
    isoName: string;
    name: string;
  };
  logoUrl: string;
  denominationType: string;
  
  hasDataBundles: boolean;
  
  pricing: {
    senderCurrency: {
      code: string;
      symbol: string;
    };
    destinationCurrency: {
      code: string;
      symbol: string;
    };
    minAmount: number | null;
    maxAmount: number | null;
    localMinAmount: number | null;
    localMaxAmount: number | null;
  };

  fixedAmounts: number[];
}


type TFormData = z.infer<typeof IntAirtimeRecipientDetailFormSchema>

const RecipientDetails = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const {update, step, provider, country} = usePurchaseIntAirtimeStore();
    
    const {
        register,
        formState: {errors},
        handleSubmit,
        control
    } =  useForm<TFormData>({
        resolver: zodResolver(IntAirtimeRecipientDetailFormSchema)
    })

    // International countries
    const {
        data: countries,
        isLoading,
    } = useQuery<TIntCountry[], Error>({
        queryKey: ["int-countries"],
        queryFn: fetchIntCountries, 
    })
    
    const selectedCountry = countries?.find((ctry) => ctry === country);

    // International airtime providers
    const {
        data: IntAirtimeProviders,
        isLoading: fetchingProviders,
        } = useQuery<AirtimeProviderType[], Error, AirtimeProviderType[], [string, string]>({
        queryKey: ['international-airtime-providers', selectedCountry?.iso2 as string],
        queryFn: fetchIntAirtimeProviders,
        enabled: !!selectedCountry
    });

    const selectedProvider = IntAirtimeProviders?.find((prov) => prov.operatorId.toString() === provider);

    const onSubmit = (data: TFormData) => {
        const localPhone = convertToLocalPhoneNumber(data.phone) 
        update({step: step+1, phone: localPhone, amount: data.amount})   
    }

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Recipient details</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Please enter your recipient details for this purchase</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div className="w-full">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="account">Select Country</label>
                    <Popover open={showDropdown} onOpenChange={setShowDropdown}>
                        <PopoverTrigger asChild>
                            <button
                                disabled={isLoading}
                                aria-expanded={showDropdown}
                                className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-semibold text-slate-800 transition-all shadow-sm flex items-center justify-between text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {country
                                    ? <div className="flex items-center gap-2">
                                        <img src={selectedCountry?.flag} className="size-6 object-cover rounded-sm" />
                                        <span>{selectedCountry?.name}</span>
                                    </div>
                                    : <span className="text-slate-500 font-normal">{isLoading ? "Loading countries..." : "Select country"}</span>}
                                <ChevronDown className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[90vw] md:w-[361px]">
                            <Command className="">
                                <CommandInput className="" placeholder="search..." />
                                <CommandList className="w-full px-3.5">
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup className="px-0">
                                    {countries && countries.map((ctry) => (
                                        <CommandItem
                                            className={cn("text-[#344054] justify-between", provider && ctry.iso2 === country?.iso2 && "font-medium")}
                                            key={ctry.iso2}
                                            value={ctry.iso2}
                                            onSelect={(currentValue) => {
                                                const ctryDetail = countries.find((ctry) => ctry.iso2 === currentValue)
                                                update(ctryDetail === selectedCountry ? {country: null} : {country: ctryDetail})
                                                setShowDropdown(false)
                                            }}
                                        >
                                            <div className="text-[#344054] flex items-center gap-2">
                                                <img src={ctry.flag} className="size-5 object-cover" />
                                                <span
                                                >{ctry.name}</span>
                                            </div>
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                country?.iso2 === ctry.iso2 ? "opacity-100" : "opacity-0"
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

                <NetworkProviderPicker
                    label="Select Provider"
                    providers={IntAirtimeProviders?.map(p => ({id: p.operatorId.toString(), name: p.name, code: p.operatorId.toString(), logo: p.logoUrl})) || []}
                    isLoading={fetchingProviders}
                    selectedProviderCode={selectedProvider?.operatorId.toString() || null}
                    onSelect={(_, providerId) => {
                        update({provider: providerId})
                    }}
                />

                <div className="w-full mt-5">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="lastname">Phone number</label>
                    <Controller
                        name="phone"
                        control={control}
                        render={({field}) => (
                            <PhoneInput
                                country={selectedCountry?.iso2.toLowerCase() || undefined}
                                value={field.value}
                                onChange={(value) => {
                                    field.onChange(value);
                                    update({ phone: convertToLocalPhoneNumber(value) });
                                }}
                                placeholder="phone number"
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                    setIsFocused(false)
                                    field.onBlur()}
                                }
                                inputProps={{
                                    name: "phone",
                                    // required: true,
                                }}
                                buttonStyle={{ 
                                    borderRadius: "16px 0 0 16px",
                                    border: isFocused ? "2px solid #2563eb" : "1px solid #e2e8f0",
                                    background: "#FFFFFF",
                                    paddingLeft: "8px"
                                }}
                                inputStyle={{
                                    width: "100%",
                                    outline: "0",
                                    background: "#FFFFFF",
                                    height: "58px",
                                    border: isFocused ? "2px solid #2563eb" : "1px solid #e2e8f0",
                                    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                                    borderRadius: "16px",
                                    color: "#1e293b",
                                    fontSize: "1.125rem",
                                    fontWeight: "600",
                                    fontFamily: "monospace"
                                }}
                            />
                                        
                        )}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}

                    {/* {
                        (!isVerifying && verifyErrData ) && <p className="text-red-500 text-sm mt-1">Please input a valid {provider.replace("-airtime", "")} number</p>
                    }
                    {isVerifying && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex items-center gap-2"><Loader2 className="animate-spin size-4 mt-2" /> <span className="italic text-sm">Verifying phone number</span></motion.div>}
                    {
                        verifiedPhone?.isValid && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex mt-1 items-center gap-2">
                            <div className="grid place-items-center size-6 rounded-full border-2 border-[#039855] bg-[#12B76A] text-white"><BsCheck2Circle className="size-2.5" /> </div>
                            <p className="text-sm font-medium">Verified</p>
                        </motion.div>
                    }
                     */}
                </div>

            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="amount">Amount</label>
                <div className="w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">{selectedCountry?.currencySymbol ?? "#"}</span>
                    <input 
                        {...register("amount")} 
                        placeholder="0.00" 
                        onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^0-9]/g, '');
                        }}
                        className="w-full border border-slate-200 rounded-2xl py-4 pl-10 pr-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm" 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="amount" 
                    />
                </div>
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
            </div>

            <button
                type="submit"
                disabled={!country || !provider}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
                Proceed to Confirm Purchase
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
            </form>
        </section>
  )
}

export default RecipientDetails