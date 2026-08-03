import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap
} from "lucide-react";
import { toast } from "sonner";

import { getStaticAccount, StaticAccount } from "@/lib/api/dashboard-apis/staticAccountApis";
import { copyToClipboard } from "@/lib/utils";

const StaticAccountDetails = () => {
    const navigate = useNavigate();
    const [copiedAccNum, setCopiedAccNum] = useState(false);
    const [copiedAll, setCopiedAll] = useState(false);

    const {
        data: staticAcc,
        isLoading: isGenerating,
    } = useQuery<StaticAccount, Error>({
        queryKey: ["get-static-account"],
        queryFn: getStaticAccount,
    });

    const handleCopyAccNumber = async () => {
        if (!staticAcc?.account.accountNumber) return;
        await copyToClipboard(staticAcc.account.accountNumber);
        setCopiedAccNum(true);
        toast.success("Account number copied!");
        setTimeout(() => setCopiedAccNum(false), 2000);
    };

    const handleCopyAll = async () => {
        if (!staticAcc) return;
        const text = `Bank: ${staticAcc.account.bankName}\nAccount Number: ${staticAcc.account.accountNumber}\nAccount Name: ${staticAcc.account.accountName}`;
        await copyToClipboard(text);
        setCopiedAll(true);
        toast.success("Account details copied!");
        setTimeout(() => setCopiedAll(false), 2000);
    };

    if (isGenerating) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                        <div className="h-5 w-1/3 bg-slate-200 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
                    <div className="h-20 bg-slate-100 rounded-2xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="size-6" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900">Your Dedicated Static Account</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Use these account details to fund your wallet anytime 24/7</p>
                </div>
            </div>

            {/* Account Card Container */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
                <div className="absolute -right-8 -top-8 size-44 rounded-full border-[24px] border-white/5 pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-xs text-blue-100">
                            <Zap className="size-3 text-amber-400" />
                            <span>Instant 24/7 Deposit</span>
                        </div>
                        <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                            {staticAcc?.account.bankName || "PayMint Bank"}
                        </span>
                    </div>

                    {/* Account Number Hero Block */}
                    <div>
                        <p className="text-xs font-medium text-blue-200 uppercase tracking-wider mb-1">Account Number</p>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-widest text-white">
                                {staticAcc?.account.accountNumber || "—"}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyAccNumber}
                                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 transition-all px-3 py-2 rounded-xl text-xs font-semibold text-white shrink-0 cursor-pointer"
                            >
                                {copiedAccNum ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                                {copiedAccNum ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>

                    {/* Details Breakdown */}
                    <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-blue-200/70 mb-0.5">Account Name</p>
                            <p className="font-semibold text-white truncate">{staticAcc?.account.accountName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200/70 mb-0.5">Bank Name</p>
                            <p className="font-semibold text-white">{staticAcc?.account.bankName || "—"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={handleCopyAll}
                    className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 h-12 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                    {copiedAll ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4 text-slate-500" />}
                    {copiedAll ? "All Details Copied!" : "Copy Full Account Details"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                    Return to Dashboard &rarr;
                </button>
            </div>
        </section>
    );
};

export default StaticAccountDetails;