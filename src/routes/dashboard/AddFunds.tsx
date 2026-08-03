import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";

import useAddFundsStore from "@/stores/useAddFundsStore";
import { AddFundsSteps } from "@/components/dashboard/add-funds/add-funds-steps";
import { getWallet, fetchProviders } from "@/lib/api/dashboard-apis/walletApis";
import { getTxnHistory } from "@/lib/api/dashboard-apis/txnHistoryApis";
import { formatAmount } from "@/lib/utils";

const AddFunds = () => {
    const navigate = useNavigate();
    const { step, reset } = useAddFundsStore();
    const queryClient = useQueryClient();
    const [showBalance, setShowBalance] = useState(true);

    // Prefetch providers immediately on mount so user doesn't wait on the form
    useEffect(() => {
        queryClient.prefetchQuery({
            queryKey: ["virtual-accounts-providers"],
            queryFn: fetchProviders,
        });
    }, [queryClient]);

    useEffect(() => {
        reset();
    }, [reset]);

    const { data: wallet, isLoading: fetchingWallet } = useQuery({
        queryKey: ["wallet-balance"],
        queryFn: getWallet,
    });

    const { data: historyData, isLoading: fetchingHistory } = useQuery({
        queryKey: ["txn-history", "wallet_fund"],
        queryFn: () => getTxnHistory({ per_page: 3, type: "wallet_fund" }),
    });

    const recentTxns = historyData?.data || [];

    const CurrentStepComponent = AddFundsSteps[step - 1].component;

    return (
        <div className="w-full max-w-[1200px] mx-auto min-h-full pb-10">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="relative z-10 shrink-0 flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-medium transition-colors w-fit"
                >
                    <ArrowLeft className="size-4" />
                    Back
                </button>

                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full w-fit ml-auto md:ml-0 uppercase tracking-widest text-[11px]">
                    STEP {step} OF 2
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (Form) */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
                        <CurrentStepComponent />
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-sm justify-center mt-4">
                        <div className="size-5 rounded-full border border-slate-300 flex items-center justify-center">
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        Your transactions are secured with 256-bit SSL encryption
                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">

                    {/* Wallet Card */}
                    <div className="bg-gradient-to-br from-[#0B45C8] to-[#082E85] rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
                            <div className="size-40 rounded-full border-[20px] border-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-blue-100 text-sm">Your Balance</p>
                                <Eye
                                    className={`size-4 text-blue-200 cursor-pointer hover:text-white transition-colors ${!showBalance ? "opacity-50" : ""}`}
                                    onClick={() => setShowBalance(!showBalance)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-display font-semibold tracking-tight">
                                    {fetchingWallet ? (
                                        <Loader2 className="animate-spin size-6" />
                                    ) : (
                                        showBalance ? formatAmount(wallet?.balance as number) : "******"
                                    )}
                                </h2>
                                <div className="size-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
                                    <div className="size-6 rounded bg-white/20 flex items-center justify-center">
                                        <span className="text-xs font-bold font-mono">₦</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Funding History */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-800 font-display font-semibold">Recent Funding</h3>
                            <Link to="/dashboard/history" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
                        </div>

                        <div className="flex flex-col gap-5">
                            {fetchingHistory ? (
                                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : recentTxns.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-4">No recent funding found.</p>
                            ) : (
                                recentTxns.map((txn) => (
                                    <div key={txn.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-green-50 border border-green-100 p-2 flex items-center justify-center overflow-hidden">
                                                <div className="size-full bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">Wallet Funding</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(txn.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-green-600">+{formatAmount(txn.amount)}</p>
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block
                                                ${txn.status === 'success' ? 'bg-green-50 text-green-600' : txn.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Link to="/dashboard/history?type=wallet_fund" className="mt-6 block w-full py-3 bg-slate-50 hover:bg-slate-100 text-center text-blue-600 text-sm font-medium rounded-xl transition-colors">
                            View all history &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFunds;