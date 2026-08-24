import RecipientDetailForm from "./RecipientDetailForm";
import InternalTransferForm from "./InternalTransferForm";
import ConfirmWithdrawalModal from "./ConfirmWithdrawalModal";
import useWithdrawFundsStore from "@/stores/useWithdrawFunds";
import { cn } from "@/lib/utils";
import { Building2, UserCheck } from "lucide-react";

const RecipientDetails = () => {
    const { withdrawalType, update } = useWithdrawFundsStore();

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Withdraw funds</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Enter the details below to transfer funds</p>
                </div>
            </div>

            {/* Type Selector Tabs */}
            <div className="flex bg-slate-100/70 p-1.5 rounded-2xl mb-8 border border-slate-200/60 shadow-inner">
                <button
                    onClick={() => update({ withdrawalType: "bank" })}
                    className={cn(
                        "flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200",
                        withdrawalType === "bank"
                            ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    )}
                >
                    <Building2 className="size-4" />
                    Bank Account
                </button>
                <button
                    onClick={() => update({ withdrawalType: "internal" })}
                    className={cn(
                        "flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200",
                        withdrawalType === "internal"
                            ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    )}
                >
                    <UserCheck className="size-4" />
                    PayMint User
                </button>
            </div>

            {/* Form Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {withdrawalType === "bank" ? <RecipientDetailForm /> : <InternalTransferForm />}
            </div>

            {/* Shared Confirmation Modal */}
            <ConfirmWithdrawalModal />
        </section>
    );
};

export default RecipientDetails;