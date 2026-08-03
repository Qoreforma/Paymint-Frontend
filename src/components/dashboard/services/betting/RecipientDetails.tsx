import { BettingServiceFormSchema } from "@/lib/zodSchemas/dashboard.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"

import { Loader2 } from "lucide-react";

import useBettingStore from "@/stores/useBettingStore"
import NetworkProviderPicker from "../shared/NetworkProviderPicker";
import { useEffect, useMemo } from "react"
import { fetchBettingProviders, verifyBettingWalletNumber } from "@/lib/api/dashboard-apis/servicesApis"
import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { BsCheck2Circle } from "react-icons/bs"

type TBetWalletVerificationResponse = {
    firstname: string,
    lastname: string,
    username: string
  }

export type verifyBetWalletPayload = {providerId: string, number: string}

export type BettingProvider = {
  id: number;
  name: string;
  code: string;
  logo: string;
}

type TFormData = z.infer<typeof BettingServiceFormSchema>

const RecipientDetails = () => {
    const {update, step, provider} = useBettingStore();

    const {
        data: providers,
        isLoading,
    } = useQuery<BettingProvider[], Error>({
        queryKey: ["betting-providers"],
        queryFn: fetchBettingProviders,
    })

    const selectedProvider = useMemo(() => providers?.find((prov) => String(prov.id) === String(provider)), [provider, providers]);

    const {mutate, isPending: isVerifying, data: verifiedWallet, error: verifyError} = useMutation<TBetWalletVerificationResponse, AxiosError, verifyBetWalletPayload>({
        mutationFn: verifyBettingWalletNumber,
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
        resolver: zodResolver(BettingServiceFormSchema)
    })

    const walletNo = watch("user");

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
        if(walletNo && walletNo.length >= 4 && provider && provider){
            mutate({providerId: provider, number: walletNo})
        }
        }, 1000);
    
        return () => clearTimeout(delayDebounce)
    }, [mutate, provider, walletNo])

    const onSubmit = (data: TFormData) => {
        update({step: step+1, amount: data.amount, user: data.user});
    }

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Recipient details</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Enter your recipient details and amount</p>
                </div>
            </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">            
            <NetworkProviderPicker
                label="Betting Provider"
                providers={providers?.map(p => ({id: String(p.id), name: p.name, code: p.code, logo: p.logo})) || []}
                isLoading={isLoading}
                selectedProviderCode={selectedProvider?.code || null}
                onSelect={(_, providerId) => {
                    update({provider: providerId})
                }}
            />
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="user">User ID/Phone number</label>
                <input {...register("user")} placeholder="Enter user id or phone" className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm" type="text" id="user" />
                {
                    (!isVerifying && verifyErrData ) && <p className="text-red-500 text-sm mt-1">{verifyErrData?.message}</p>
                }
                {isVerifying && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex items-center gap-2 mt-2"><Loader2 className="animate-spin size-4 text-blue-600" /> <span className="italic text-sm text-slate-500">Verifying user id</span></motion.div>}
                {
                    verifiedWallet && <motion.div initial={{opacity: 0}} animate={{opacity: 1, transition: {duration: .5}}} className="flex mt-2 items-center gap-2">
                        <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white"><BsCheck2Circle className="size-3" /> </div>
                        <p className="text-sm font-medium text-green-600">{verifiedWallet.firstname} {verifiedWallet.lastname}</p>
                    </motion.div>
                }
                {errors.user && <p className="text-red-500 text-sm mt-1">{errors.user.message}</p>}
            </div>

            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="amount">Amount</label>
                <div className="w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">₦</span>
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
                disabled={!provider}
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