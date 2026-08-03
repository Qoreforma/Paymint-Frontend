import { useState } from "react";
import { PiCopy } from "react-icons/pi";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAddFundsStore from "@/stores/useAddFundsStore";
import { copyToClipboard, formatAmount } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";

const MakePayment = () => {
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const { update, generatedAccount, paymentMethod, amount, reset } = useAddFundsStore();

    const copyAccount = async (text: string) => {
        await copyToClipboard(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const expiresAt = generatedAccount?.paymentDetails?.expiresAt || new Date().toISOString();
    const timeLeft = useCountdown(expiresAt, expiresAt);

    const handlePayment = () => {
        navigate("/dashboard");
        reset();
    }

    if (!generatedAccount) return null;

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                    {paymentMethod?.logo
                        ? <img src={paymentMethod.logo} className="size-8 object-cover" alt={paymentMethod.name} />
                        : <div className="size-8 bg-blue-200 rounded-full" />
                    }
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">
                        {generatedAccount.paymentDetails?.bankName} Payment
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Transfer {formatAmount(parseInt(amount))} to the account below
                    </p>
                </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col gap-5">
                {/* Account Number */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                        <p className="text-2xl font-bold text-blue-700 font-mono tracking-widest">
                            {generatedAccount.paymentDetails?.accountNumber}
                        </p>
                    </div>
                    <button
                        disabled={copied}
                        onClick={() => copyAccount(generatedAccount.paymentDetails?.accountNumber as string)}
                        className="flex items-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-2 rounded-lg text-sm font-medium"
                    >
                        {copied ? <Check className="text-green-500 size-4" /> : <PiCopy className="size-4" />}
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>

                <div className="h-px bg-slate-200" />

                {/* Bank Name */}
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bank Name</p>
                    <p className="text-slate-800 font-semibold">{generatedAccount.paymentDetails?.bankName}</p>
                </div>

                <div className="h-px bg-slate-200" />

                {/* Account Name */}
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Name</p>
                    <p className="text-slate-800 font-semibold">{generatedAccount.paymentDetails?.accountName}</p>
                </div>

                {/* Expiry countdown */}
                {generatedAccount.paymentDetails?.expiresAt && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                        <svg className="size-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-amber-700">Account expires in <strong>{timeLeft}</strong></span>
                    </div>
                )}
            </div>

            <button
                onClick={handlePayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 mt-6 shadow-md"
            >
                I've made the transfer
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </button>

            <button
                type="button"
                onClick={() => update({ step: 1 })}
                className="w-full mt-3 text-slate-500 hover:text-slate-700 text-sm font-medium py-2 transition-colors"
            >
                ← Change payment method
            </button>
        </section>
    )
}

export default MakePayment