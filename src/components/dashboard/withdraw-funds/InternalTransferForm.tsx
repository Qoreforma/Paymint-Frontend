import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";
import { BsCheck2Circle } from "react-icons/bs";
import { motion } from "framer-motion";

import useWithdrawFundsStore from "@/stores/useWithdrawFunds";
import { verifyInternalBeneficiary } from "@/lib/api/dashboard-apis/walletApis";

const InternalTransferSchema = z.object({
    identifier: z.string().min(3, "Identifier must be at least 3 characters"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Invalid amount"),
});

type TFormData = z.infer<typeof InternalTransferSchema>;

const InternalTransferForm = () => {
    const { update, beneficiary, amount } = useWithdrawFundsStore();

    const { mutate: verifyUser, data: verifiedUser, isPending: isVerifying, error: verError, reset: resetVerification } = useMutation({
        mutationFn: verifyInternalBeneficiary,
    });

    const {
        register,
        formState: { errors },
        watch,
        setValue,
        handleSubmit
    } = useForm<TFormData>({
        resolver: zodResolver(InternalTransferSchema),
        defaultValues: {
            identifier: beneficiary || "",
            amount: amount || "",
        }
    });

    const identifier = watch("identifier");
    const amountVal = watch("amount");

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (identifier && identifier.length >= 3) {
                verifyUser(identifier);
            } else {
                resetVerification();
            }
        }, 1000);

        return () => clearTimeout(delayDebounce);
    }, [identifier, verifyUser, resetVerification]);

    const onFormSubmit = (data: TFormData) => {
        const benName = verifiedUser ? `${verifiedUser.firstname} ${verifiedUser.lastname}` : "";
        update({
            beneficiary: verifiedUser?.username || data.identifier,
            beneficiaryName: benName,
            amount: data.amount,
            showConfirmModal: true,
        });
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="w-full flex flex-col gap-6">
            {/* Beneficiary Identifier */}
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="identifier">Recipient (Username, Email, or Ref Code)</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <input
                        {...register("identifier")}
                        placeholder="e.g. johndoe or user@email.com"
                        className="w-full h-14 border border-slate-200 rounded-xl py-4 pl-11 pr-4 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 text-slate-800 transition-all shadow-sm"
                        type="text"
                        id="identifier"
                    />
                </div>
                {isVerifying && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2">
                        <Loader2 className="animate-spin size-4 text-blue-600" />
                        <span className="italic text-sm text-slate-500">Searching for user...</span>
                    </motion.div>
                )}
                {verifiedUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex mt-2 items-center gap-2">
                        <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white">
                            <BsCheck2Circle className="size-3" />
                        </div>
                        <p className="text-sm font-medium text-green-600">
                            {verifiedUser.firstname} {verifiedUser.lastname} (@{verifiedUser.username})
                        </p>
                    </motion.div>
                )}
                {verError && <p className="text-red-500 text-sm mt-1">User not found</p>}
                {errors.identifier && <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>}
            </div>

            {/* Amount */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="amount">Amount</label>
                </div>
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
                    {[100, 500, 1000, 2000, 5000].map((amt) => (
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

            {/* Submit button */}
            <button
                type="submit"
                disabled={!verifiedUser || !amountVal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
                Proceed to Confirm
                <ArrowRight className="size-4" />
            </button>
        </form>
    );
};

export default InternalTransferForm;
