import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { TVCableFormSchema } from "@/lib/zodSchemas/dashboard.schema"
import useTVCableStore from "@/stores/useTVCableStore"
import NetworkProviderPicker from "../shared/NetworkProviderPicker";
import PackagesDropdown from "./PackagesDropdown";

import { fetchTvProviders, getTvProducts, verifySmartcardNumber } from "@/lib/api/dashboard-apis/servicesApis"
import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { BsCheck2Circle } from "react-icons/bs"

export type TvProviderType = {
      id: string,
      name: string,
      code: string,
      logo: string
      serviceTypeCode: string
}

export type TvProductType = {
      id: string,
      name: string,
      code: string,
      logo: string,
      amount: number,
      validity: string
      service: string
}

export type SmartCardNoVerificationResponse = {
    valid: boolean,
    status: string,
    customerName: string,
    dueDate: string; // ISO date string
    smartCardNumber: string
}

export type VerifySmartCardPayload = {provider: string, number: string}

type TFormData = z.infer<typeof TVCableFormSchema>

const RecipientDetails = () => {
    const {update, provider, package: cablePackage} = useTVCableStore();

    const {
        data: providers,
        isLoading: fetchingProviders,
    } = useQuery<TvProviderType[], Error>({
        queryKey: ["tvcable-providers"],
        queryFn: fetchTvProviders,
    })

    const {
        data: TvProducts,
        isLoading: fetchingProducts,
        isError: fetchProductsError,
        } = useQuery<TvProductType[], Error, TvProductType[], [string, string]>({
        queryKey: ['tv-products', provider?.id as string],
        queryFn: getTvProducts,
        enabled: !!provider
    });

    const {mutate, isPending: isVerifying, data: verifiedCard, error: verifyError} = useMutation<SmartCardNoVerificationResponse, AxiosError, VerifySmartCardPayload>({
        mutationFn: verifySmartcardNumber,
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
        handleSubmit,
        watch
    } =  useForm<TFormData>({
        resolver: zodResolver(TVCableFormSchema)
    })

    const smartCardNo = watch("smartcardNo");


    useEffect(() => {
        const delayDebounce = setTimeout(() => {
        if(smartCardNo && smartCardNo.length >= 10 && provider){
            mutate({provider: provider.code, number: smartCardNo})
        }
        }, 1000);
    
        return () => clearTimeout(delayDebounce)
    }, [smartCardNo, mutate, provider])

    const onSubmit = (data: TFormData) => {
        update({step: 2, smartCardNo: data.smartcardNo});
    }

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Select Provider & Package</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Please select the category that best suits you</p>
                </div>
            </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            <NetworkProviderPicker
                label="TV Provider"
                providers={providers?.map((p) => ({ id: p.id, name: p.name, code: p.code, logo: p.logo }))}
                isLoading={fetchingProviders}
                selectedProviderCode={provider?.code || null}
                onSelect={(code) => {
                    const found = providers?.find((p) => p.code === code);
                    update({ provider: found || null, package: null });
                }}
            />

            <PackagesDropdown error={fetchProductsError} disable={!provider} isLoading={fetchingProducts} packagesArr={TvProducts} />

            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="smartcard-number">Smartcard number</label>
                <input {...register("smartcardNo")} placeholder="Enter smartcard number" className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm" type="text" id="smartcard-number" />
                {
                    (!isVerifying && verifyErrData ) && <p className="text-red-500 text-sm mt-1">{verifyErrData?.message}</p>
                }
                
                {isVerifying && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex items-center gap-2 mt-2"><Loader2 className="animate-spin size-4 text-blue-600" /> <span className="italic text-sm text-slate-500">Verifying smartcard number</span></motion.div>}
                {
                    verifiedCard && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex mt-2 items-center gap-2">
                        <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white"><BsCheck2Circle className="size-3" /> </div>
                        <p className="text-sm font-medium text-green-600">{verifiedCard.customerName}</p>
                    </motion.div>
                }
                {errors.smartcardNo && <p className="text-red-500 text-sm mt-1">{errors.smartcardNo.message}</p>}
            </div>

            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="amount">Amount</label>
                <div className="w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">₦</span>
                    <input 
                        disabled 
                        value={cablePackage?.amount || ''} 
                        className="w-full border border-slate-200 rounded-2xl py-4 pl-10 pr-4 bg-slate-50 outline-none placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm opacity-70 cursor-not-allowed" 
                        id="amount" 
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={!provider || !cablePackage || !verifiedCard}
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