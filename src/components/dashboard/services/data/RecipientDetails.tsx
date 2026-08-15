import { DataRecipientDetailFormSchema } from "@/lib/zodSchemas/dashboard.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import PhoneInput from "react-phone-input-2"
import { z } from "zod"
import { motion } from "framer-motion"
import useServiceFlowStore from "@/stores/useServiceFlowStore"
import { cn, convertToLocalPhoneNumber, formatAmount, detectNigerianNetwork } from "@/lib/utils"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchAllDataPlans, fetchDataProviders, verifyPhoneNumber, TDataServiceProvider, IDataPlan } from "@/lib/api/dashboard-apis/servicesApis"
import { phoneNoVerificationResponse, VerifyPhoneNoPayload } from "../airtime/RecipientDetails"
import { AxiosError } from "axios"
import { BsCheck2Circle } from "react-icons/bs"
import { useAuth } from "@/context/AuthContext"

import NetworkProviderPicker from "../shared/NetworkProviderPicker"
import DataPlanPicker from "../shared/DataPlanPicker"

type TFormData = z.infer<typeof DataRecipientDetailFormSchema>

const RecipientDetails = () => {
    const [prodAmount, setProdAmount] = useState<number | undefined>();
    const [isFocused, setIsFocused] = useState(false);
    const [isPorted, setIsPorted] = useState(false);
    
    // validity filter state
    const [selectedValidity, setSelectedValidity] = useState<string>("All");

    const { user } = useAuth();
    const { update, step, providerName, providerId, plan, dataPlans, cashbackRule } = useServiceFlowStore();

    const formatInitialPhone = (phone?: string) => {
        if (!phone) return "";
        const digits = phone.replace(/\D/g, "");
        if (digits.startsWith("234")) return digits;
        if (digits.startsWith("0")) return "234" + digits.slice(1);
        return "234" + digits;
    };

    const {
        formState: { errors },
        handleSubmit,
        control,
        watch,
        setValue
    } = useForm<TFormData>({
        resolver: zodResolver(DataRecipientDetailFormSchema),
        defaultValues: {
            phone: formatInitialPhone(user?.phone)
        }
    })

    const currentPhone = watch("phone");
    useEffect(() => {
        if (user?.phone && !currentPhone) {
            setValue("phone", formatInitialPhone(user.phone), { shouldValidate: true });
        }
    }, [user?.phone, setValue, currentPhone]);

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
    } = useQuery<TDataServiceProvider[], Error>({
        queryKey: ["data-providers"],
        queryFn: fetchDataProviders,
    })

    const {
        data: DataPlans,
        isLoading: fetchingPlans,
        error: fetchPlansError,
        isSuccess
    } = useQuery<IDataPlan[], Error, IDataPlan[], [string, string]>({
        queryKey: ['data-plans', providerId as string],
        queryFn: fetchAllDataPlans,
        enabled: !!providerId
    });

    const phoneNo = watch("phone");

    // Auto-detect network when phone number changes
    useEffect(() => {
        if (!phoneNo || !providers || isPorted) return;
        
        const detectedNetwork = detectNigerianNetwork(phoneNo);
        if (detectedNetwork) {
            // Find the provider that matches the detected network code
            const matchedProvider = providers.find(p => p.code.toLowerCase().includes(detectedNetwork));
            if (matchedProvider && matchedProvider.id !== providerId) {
                update({ providerName: matchedProvider.code, providerId: matchedProvider.id, plan: "" });
            }
        }
    }, [phoneNo, providers, update, providerId, isPorted]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (phoneNo && phoneNo.length >= 10 && providerName && !isPorted) {
                mutate({ phone: convertToLocalPhoneNumber(phoneNo), network: providerName })
            }
        }, 1000);

        return () => clearTimeout(delayDebounce)
    }, [phoneNo, mutate, providerName, isPorted])

    useEffect(() => {
        if (isSuccess && DataPlans) {
            update({ dataPlans: DataPlans });
        }
    }, [isSuccess, DataPlans, update]);

    const selectedPlan = useMemo(() => {
        return dataPlans?.find((dataPlan) => (dataPlan.id || (dataPlan as any)._id) === plan) ?? null;
    }, [dataPlans, plan]);

    useEffect(() => {
        setProdAmount(selectedPlan?.amount)
        if (selectedPlan) {
            update({ type: selectedPlan.dataType as "DIRECT" | "SME" });
        }
    }, [selectedPlan, setValue, update]);

    // Derive dynamic validities
    const validities = useMemo(() => {
        if (!DataPlans) return ["All"];
        const uniqueValidities = Array.from(new Set(DataPlans.map(p => p.validity).filter(Boolean)));
        return ["All", ...uniqueValidities];
    }, [DataPlans]);

    // Filter plans
    const filteredPlans = useMemo(() => {
        if (!DataPlans) return [];
        if (selectedValidity === "All") return DataPlans;
        return DataPlans.filter(p => p.validity === selectedValidity);
    }, [DataPlans, selectedValidity]);


    const onSubmit = (data: TFormData) => {
        if (!plan) {
            toast.info("Please select a plan!")
            return;
        }
        const localPhone = convertToLocalPhoneNumber(data.phone)
        update({ step: step + 1, phone: localPhone })
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
                    <p className="text-slate-500 text-sm mt-0.5">Enter your recipient details and select a data plan</p>
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

                    {(!isVerifying && verifyErrData && !isPorted) && <p className="text-red-500 text-sm mt-1">Please input a valid {providerName?.replace("-data", "")} number</p>}
                    {(isVerifying && !isPorted) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: .5 } }} className="flex items-center gap-2 mt-2"><Loader2 className="animate-spin size-4 text-blue-600" /> <span className="italic text-sm text-slate-500">Verifying phone number</span></motion.div>}
                    {(verifiedPhone?.isValid && !isPorted) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: .5 } }} className="flex mt-2 items-center gap-2">
                            <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white"><BsCheck2Circle className="size-3" /> </div>
                            <p className="text-sm font-medium text-green-600">Verified</p>
                        </motion.div>
                    )}
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                {/* Network section */}
                <div className="w-full">
                    <NetworkProviderPicker
                        providers={providers}
                        isLoading={isLoading}
                        selectedProviderCode={providerName}
                        onSelect={(code, id) => update({ providerName: code, providerId: id, plan: "" })}
                    />
                </div>

                {/* Plans section */}
                {providerId && (
                    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                            <h3 className="text-sm text-[#344054] font-medium">Select a Data Plan</h3>
                            
                            {/* Validity Filter */}
                            {!fetchingPlans && !fetchPlansError && validities.length > 1 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {validities.map((validity) => (
                                        <button
                                            key={validity}
                                            type="button"
                                            onClick={() => setSelectedValidity(validity)}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                                                selectedValidity === validity 
                                                    ? "bg-[var(--brand-ink)] text-white" 
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            )}
                                        >
                                            {validity}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DataPlanPicker
                            plans={filteredPlans}
                            isLoading={fetchingPlans}
                            error={fetchPlansError}
                            selectedPlanId={plan}
                            onSelect={(id) => update({ plan: id })}
                        />
                    </div>
                )}

                {/* Bottom confirmation section */}
                {plan && (
                    <div className="w-full flex flex-col gap-6">
                        <div className="w-full">
                            <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="amount">Amount Payable</label>
                            <div className="w-full h-fit relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">₦</span>
                                <input
                                    disabled
                                    value={prodAmount ? prodAmount.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ""}
                                    className="w-full border border-slate-200 rounded-2xl py-4 pl-10 pr-4 bg-slate-50 text-slate-700 outline-none font-mono text-lg font-semibold disabled:opacity-100 shadow-sm"
                                    id="amount"
                                />
                            </div>
                            
                            {cashbackRule && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mt-6 bg-[#E8F8EE] border border-[#A7E6C0] rounded-xl p-4 flex items-center gap-3">
                                    <div className="bg-[#12B76A] rounded-lg p-1.5"><BsCheck2Circle className="text-white size-4" /></div>
                                    <span className="text-sm font-semibold text-[#027A48]">
                                        Earn {cashbackRule?.type === 'percentage'
                                            ? `${cashbackRule?.value}%`
                                            : formatAmount(Number(cashbackRule?.value))} Cashback on Data purchases
                                    </span>
                                    <svg className="size-4 text-[#027A48] ml-auto opacity-70 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </motion.div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={fetchingPlans || isLoading || !plan || !phoneNo}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            Proceed to Confirm Purchase
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                )}

            </form>
        </section>
    )
}

export default RecipientDetails
