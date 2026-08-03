import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {motion} from "framer-motion"

import { ElectricityFormSchema } from "@/lib/zodSchemas/dashboard.schema"
import { BsCheck2Circle } from "react-icons/bs";
import { cn } from "@/lib/utils"
import useElectricityBillsStore from "@/stores/useElectricityBillsStore"
import { useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import NetworkProviderPicker from "../shared/NetworkProviderPicker"
import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchElectricityProviders, verifyMeterNumber } from "@/lib/api/dashboard-apis/servicesApis"
import { AxiosError } from "axios"
// import { toast } from "sonner"

const MeterTypes = [
    {
        id: 1,
        name: "prepaid",
        label: "Prepaid"
    },
    {
        id: 2,
        name: "postpaid",
        label: "Postpaid"
    },
]

interface ElectricityVerificationResponse {
  customerName: string;
  meterType: string;
  address: string;
  valid: boolean;
}

export type ElectricityProvider = {
  id: number;
  name: string;
  code: string;
  logo: string;
}

interface VerifyMeterPayload {
  providerCode: string;
  type: string;
  number: string;
}

type TFormData = z.infer<typeof ElectricityFormSchema>

const RecipientDetails = () => {
    const {update, step, meterType, provider} = useElectricityBillsStore();

    const {
        data: providers,
        isLoading,
    } = useQuery<ElectricityProvider[], Error>({
        queryKey: ["electricity-providers"],
        queryFn: fetchElectricityProviders,
    })

    const selectedProvider =  useMemo(() => providers?.find((prov) => String(prov.id) === String(provider)), [provider, providers]);

    const {mutate, isPending: isVerifying, data: verifiedMeter, error: verifyError} = useMutation<ElectricityVerificationResponse, AxiosError, VerifyMeterPayload>({
        mutationFn: verifyMeterNumber,
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
        register,
        formState: {errors},
        watch,
        handleSubmit,
    } =  useForm<TFormData>({
        resolver: zodResolver(ElectricityFormSchema)
    })

    const meterNo = watch("meterNumber");

    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        if(meterNo && meterNo.length >= 11 && provider && meterType){
            mutate({providerCode: selectedProvider?.code as string, type: meterType, number: meterNo})
        }
      }, 1000);
    
      return () => clearTimeout(delayDebounce)
    }, [meterNo, mutate, provider, meterType, selectedProvider])
    

    const onSubmit = (data: TFormData) => {
        update({step: step+1, meterNumber: data.meterNumber, quantity: data.quantity});
    }

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Recipient details</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Enter your meter details and amount</p>
                </div>
            </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2">Meter type</label>
                <div className="grid grid-cols-2 gap-3">
                    {
                        MeterTypes.map(({id, name, label}) => {
                            const isSelected = meterType === name;
                            return (
                                <button 
                                    key={id} 
                                    onClick={() => update({meterType: name})} 
                                    type="button" 
                                    className={cn("relative w-full h-12 cursor-pointer border rounded-xl text-sm font-semibold transition-colors", isSelected ? "text-white border-blue-600" : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50" )}
                                >
                                    <span className="z-10 relative">{label}</span>
                                    {isSelected && <motion.div
                                        layoutId="electricity-meter-type"
                                        className="absolute inset-0 bg-blue-600 rounded-xl"
                                    />}
                                </button>
                            )
                        })
                    }
                </div>
            </div>
            
            <NetworkProviderPicker
                label="Distribution company"
                providers={providers?.map(p => ({id: String(p.id), name: p.name, code: p.code, logo: p.logo})) || []}
                isLoading={isLoading}
                selectedProviderCode={selectedProvider?.code || null}
                onSelect={(_, providerId) => {
                    update({provider: providerId})
                }}
            />

            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="meterNumber">Meter number</label>
                <input {...register("meterNumber")} placeholder="Enter meter number" className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm" type="text" id="meterNumber" />
                {
                    (!isVerifying && verifyErrData ) && <p className="text-red-500 text-sm mt-1">{verifyErrData?.message}</p>
                }
                {isVerifying && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex items-center gap-2 mt-2"><Loader2 className="animate-spin size-4 text-blue-600" /> <span className="italic text-sm text-slate-500">Verifying meter number</span></motion.div>}
                {
                    verifiedMeter && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex mt-2 items-center gap-2">
                    <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white"><BsCheck2Circle className="size-3" /> </div>
                    <p className="text-sm font-medium text-green-600">{verifiedMeter.customerName}</p>
                </motion.div>
                }
                {errors.meterNumber && <p className="text-red-500 text-sm mt-1">{errors.meterNumber.message}</p>}
            </div>

            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="quantity">Amount</label>
                <div className="w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">₦</span>
                    <input 
                        {...register("quantity")} 
                        placeholder="0.00" 
                        onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^0-9]/g, '');
                        }}
                        className="w-full border border-slate-200 rounded-2xl py-4 pl-10 pr-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm" 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="quantity" 
                    />
                </div>
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
            </div>

            <button
                type="submit"
                disabled={!provider || !meterNo}
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

export default RecipientDetails;