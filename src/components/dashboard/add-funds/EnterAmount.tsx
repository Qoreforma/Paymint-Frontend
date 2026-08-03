import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";

import useAddFundsStore from "@/stores/useAddFundsStore";
import { fetchProviders, fundWallet } from "@/lib/api/dashboard-apis/walletApis";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { TGeneratedBankAccount, TPaymentProvider, TFundWalletPayload } from "./SelectPaymentMethod";

const MergedFormSchema = z.object({
  amount: z.string().min(2, "Please enter a valid amount"),
});

type TFormData = z.infer<typeof MergedFormSchema>

const EnterAmount = () => {
    const { update, paymentMethod, amount } = useAddFundsStore();

    const {
            register,
            formState: { errors },
            handleSubmit,
            setValue,
            watch,
    } = useForm<TFormData>({
        resolver: zodResolver(MergedFormSchema),
        defaultValues: {
            amount: amount || ""
        }
    })

    const {
        data: providers,
        isLoading: isProvidersLoading,
    } = useQuery<TPaymentProvider[], Error>({
        queryKey: ["virtual-accounts-providers"],
        queryFn: fetchProviders,
    })

    const { mutate, isPending } = useMutation<TGeneratedBankAccount, AxiosError, TFundWalletPayload>({
      mutationFn: fundWallet,
      onSuccess: (data) => {
        update({ generatedAccount: data });
        update({ step: 2 });
      },
      onError: (error: AxiosError) => {
        const errData = error.response?.data as { message?: string };
          if (errData.message) {
              return toast.error(errData.message);
        }
        toast.error("Something went wrong, please try again");
      }
    })

    const onSubmit = (data: TFormData) => {
        if (!paymentMethod) {
            toast.error("Please select a funding method");
            return;
        }
        update({ amount: data.amount });
        mutate({ provider: paymentMethod.code, amount: data.amount });
    }

    const amountValue = watch("amount");

  return (
    <section className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-display font-semibold text-slate-800">Add funds</h2>
                <p className="text-slate-500 text-sm mt-0.5">Enter amount and select a funding method below</p>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            {/* Amount */}
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="amount">Amount to fund</label>
                <div className="w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold text-lg">₦</span>
                    <input
                        {...register("amount")}
                        placeholder="0.00"
                        className="w-full border border-slate-200 rounded-2xl py-4 pl-10 pr-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm"
                        type="number"
                        min={1}
                        id="amount"
                    />
                </div>
                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-3 mt-4">
                    {[1000, 2000, 5000, 10000, 20000].map((amt) => (
                        <button
                            key={amt}
                            type="button"
                            onClick={() => setValue("amount", amt.toString(), { shouldValidate: true })}
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 transition-colors"
                        >
                            ₦{amt.toLocaleString()}
                        </button>
                    ))}
                </div>
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-3">Select a funding method</label>
                <div className="flex flex-col gap-3">
                    {isProvidersLoading && Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="w-full rounded-xl bg-slate-100 h-16 animate-pulse" />
                    ))}
                    {!isProvidersLoading && providers && providers.length > 0 && providers.map((prov) => (
                        prov.paymentOptions.includes("bank_transfer") &&
                        <div
                            key={prov.name}
                            onClick={() => update({ paymentMethod: prov })}
                            className={cn(
                                "w-full rounded-xl px-4 border bg-white h-16 flex items-center gap-3 transition cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 shadow-sm",
                                prov === paymentMethod ? "border-blue-500 bg-blue-50/30" : "border-slate-200"
                            )}
                        >
                            <img className="size-7 object-cover rounded" src={prov.logo} alt={prov.name} />
                            <span className="text-sm font-medium text-slate-700">{prov.name}</span>
                            <span className="ml-auto">
                                {prov === paymentMethod
                                    ? <MdRadioButtonChecked className="size-5 text-blue-600" />
                                    : <MdRadioButtonUnchecked className="size-5 text-slate-300" />
                                }
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending || isProvidersLoading || !amountValue || !paymentMethod}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
                {isPending ? (
                    <>Generating account...</>
                ) : (
                    <>
                        Proceed to Payment
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </>
                )}
            </button>
        </form>
    </section>
  )
}

export default EnterAmount