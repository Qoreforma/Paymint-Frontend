import { AirtimeRecipientDetailFormSchema } from "@/lib/zodSchemas/dashboard.schema"
import useServiceFlowStore from "@/stores/useServiceFlowStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import PhoneInput from "react-phone-input-2"
import { z } from "zod"


import { Loader2 } from "lucide-react"
import { convertToLocalPhoneNumber, detectNigerianNetwork, formatAmount } from "@/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchAirtimeProviders, verifyPhoneNumber, TAirtimeServiceProvider } from "@/lib/api/dashboard-apis/servicesApis"
import { AxiosError } from "axios"
import { BsCheck2Circle } from "react-icons/bs"
import { motion } from "framer-motion"

import NetworkProviderPicker from "../shared/NetworkProviderPicker"
import { useAuth } from "@/context/AuthContext"

export type VerifyPhoneNoPayload = { phone: string; network: string };
export type phoneNoVerificationResponse = {
    isValid: boolean;
};

type TFormData = z.infer<typeof AirtimeRecipientDetailFormSchema>

const RecipientDetails = () => {
    const [isFocused, setIsFocused] = useState(false);
    const { user } = useAuth();


    const { update, step, provider, cashbackRule } = useServiceFlowStore();

    const formatInitialPhone = (phone?: string) => {
        if (!phone) return "";
        const digits = phone.replace(/\D/g, "");
        if (digits.startsWith("234")) return digits;
        if (digits.startsWith("0")) return "234" + digits.slice(1);
        return "234" + digits;
    };

    const [isPorted, setIsPorted] = useState(false);

    const {
        register,
        formState: { errors },
        handleSubmit,
        watch,
        control,
        setValue
    } = useForm<TFormData>({
        resolver: zodResolver(AirtimeRecipientDetailFormSchema),
        defaultValues: {
            phone: formatInitialPhone(user?.phone)
        }
    })

    const currentPhone = watch("phone");
    const currentAmount = watch("amount");

    useEffect(() => {
        if (user?.phone && !currentPhone) {
            const formatted = formatInitialPhone(user.phone);
            setValue("phone", formatted, { shouldValidate: true });
            update({ phone: convertToLocalPhoneNumber(formatted) });
        } else if (currentPhone) {
            update({ phone: convertToLocalPhoneNumber(currentPhone) });
        }
    }, [user?.phone, setValue, currentPhone, update]);

    useEffect(() => {
        if (currentAmount !== undefined) {
            update({ amount: currentAmount });
        }
    }, [currentAmount, update]);

    const { mutate, isPending: isVerifying, data: verifiedPhone, error: verifyError } = useMutation<phoneNoVerificationResponse, AxiosError, VerifyPhoneNoPayload>({
        mutationFn: verifyPhoneNumber,
    })

    let verifyErrData: { message?: string } | undefined;
    if (verifyError?.response?.data) {
        verifyErrData = verifyError.response.data as { message?: string };
    }

    const {
        data: providers,
        isLoading,
    } = useQuery<TAirtimeServiceProvider[], Error>({
        queryKey: ["airtime-providers"],
        queryFn: fetchAirtimeProviders,
    })

    const phoneNo = watch("phone");

    // Auto-detect network when phone number changes
    useEffect(() => {
        if (!phoneNo || !providers || isPorted) return;
        
        const detectedNetwork = detectNigerianNetwork(phoneNo);
        if (detectedNetwork) {
            // Find the provider that matches the detected network code
            const matchedProvider = providers.find(p => p.code.toLowerCase().includes(detectedNetwork));
            if (matchedProvider && matchedProvider.code !== provider) {
                update({ provider: matchedProvider.code });
            }
        }
    }, [phoneNo, providers, update, provider, isPorted]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (phoneNo && phoneNo.length >= 10 && provider && !isPorted) {
                mutate({ network: provider, phone: convertToLocalPhoneNumber(phoneNo) })
            }
        }, 1000);

        return () => clearTimeout(delayDebounce)
    }, [phoneNo, mutate, provider, isPorted])

    const onSubmit = (data: TFormData) => {
        const localPhone = convertToLocalPhoneNumber(data.phone)
        update({ step: step + 1, phone: localPhone, amount: data.amount })
    }

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Recipient details</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Enter your recipient details and amount</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                
                {/* Phone section */}
                <div className="w-full relative">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="phone">Phone number</label>
                    <div className="relative">
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <PhoneInput
                                    country={'ng'}
                                    value={field.value}
                                    onChange={(value) => {
                                        field.onChange(value);
                                        update({ phone: convertToLocalPhoneNumber(value) });
                                    }}
                                    placeholder="813 325 2105"
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => {
                                        setIsFocused(false)
                                        field.onBlur()
                                    }}
                                    inputProps={{
                                        name: "phone",
                                        id: "phone"
                                    }}
                                    buttonStyle={{
                                        borderRadius: "12px 0 0 12px",
                                        border: isFocused ? "1px solid #2563EB" : "1px solid #E2E8F0",
                                        background: "#F8FAFC",
                                        padding: "0 8px",
                                    }}
                                    inputStyle={{
                                        width: "100%",
                                        outline: "0",
                                        background: "#FFFFFF",
                                        height: "56px",
                                        border: isFocused ? "1px solid #2563EB" : "1px solid #E2E8F0",
                                        boxShadow: isFocused ? "0 0 0 4px rgba(37, 99, 235, 0.1)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
                                        borderRadius: "12px",
                                        color: "#1E293B",
                                        fontSize: "16px",
                                        paddingLeft: "70px",
                                        paddingRight: "48px"
                                    }}
                                />
                            )}
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                        <input 
                            type="checkbox" 
                            id="isPorted" 
                            checked={isPorted} 
                            onChange={(e) => setIsPorted(e.target.checked)}
                            className="size-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="isPorted" className="text-sm text-slate-600 cursor-pointer select-none">
                            This is a ported number (skip network auto-detection)
                        </label>
                    </div>

                    {(!isVerifying && verifyErrData && !isPorted) && <p className="text-red-500 text-sm mt-1">Please input a valid {provider?.replace("-airtime", "")} number</p>}
                    {(isVerifying && !isPorted) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: .5 } }} className="flex items-center gap-2 mt-2"><Loader2 className="animate-spin size-4 text-blue-600" /> <span className="italic text-sm text-slate-500">Verifying phone number</span></motion.div>}
                    {(verifiedPhone?.isValid && !isPorted) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: .5 } }} className="flex mt-2 items-center gap-2">
                            <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white"><BsCheck2Circle className="size-3" /> </div>
                            <p className="text-sm font-medium text-green-600">Verified</p>
                        </motion.div>
                    )}
                </div>

                {/* Network section */}
                <div className="w-full">
                    <NetworkProviderPicker
                        providers={providers}
                        isLoading={isLoading}
                        selectedProviderCode={provider}
                        onSelect={(code) => update({ provider: code })}
                    />
                </div>

                {/* Amount section */}
                <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="amount">Amount</label>
                    </div>
                    
                    <div className="w-full relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">₦</span>
                        <input
                            {...register("amount")}
                            placeholder="0.00"
                            className="w-full border border-slate-200 rounded-2xl py-4 pl-10 pr-[120px] bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm"
                            onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                input.value = input.value.replace(/[^0-9]/g, '');
                            }}
                            type="text"
                            min={50}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="amount"
                        />

                    </div>
                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}

                    {/* Quick Amount Chips */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => {
                                    update({ amount: amt.toString() });
                                    setValue("amount", amt.toString(), { shouldValidate: true });
                                }}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 transition-colors"
                            >
                                ₦{amt.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    {/* Cashback Rule */}
                    {cashbackRule && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mt-6 bg-[#E8F8EE] border border-[#A7E6C0] rounded-xl p-4 flex items-center gap-3">
                            <div className="bg-[#12B76A] rounded-lg p-1.5"><BsCheck2Circle className="text-white size-4" /></div>
                            <span className="text-sm font-semibold text-[#027A48]">
                                Earn {cashbackRule?.type === 'percentage'
                                    ? `${cashbackRule?.value}%`
                                    : formatAmount(Number(cashbackRule?.value))} Cashback on Airtime purchases
                            </span>
                            <svg className="size-4 text-[#027A48] ml-auto opacity-70 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </motion.div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!provider || !phoneNo}
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