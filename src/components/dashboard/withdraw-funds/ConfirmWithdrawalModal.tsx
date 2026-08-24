import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Lock, ShieldCheck, UserCheck, Building2, CreditCard, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import CustomButton from "@/components/CustomButton";
import { useAuth } from "@/context/AuthContext";
import useWithdrawFundsStore from "@/stores/useWithdrawFunds";
import { withdrawToBank, transferFunds } from "@/lib/api/dashboard-apis/walletApis";
import { TWithdrawToBankResponse } from "./ConfirmFundsWithdrawal";
import { addBankAccount } from "@/lib/api/dashboard-apis/settingsApis";

const ConfirmWithdrawalModal = () => {
    const { user } = useAuth();
    const [pin, setPin] = useState("");

    const {
        withdrawalType,
        showConfirmModal,
        update,
        amount,
        selectedBank,
        bank_account,
        accountName,
        beneficiary,
        beneficiaryName,
        save,
    } = useWithdrawFundsStore();

    const { mutate: addAccount } = useMutation({
        mutationFn: addBankAccount,
    });

    const { mutate: withdrawBankMutate, isPending: isWithdrawingBank } = useMutation<TWithdrawToBankResponse, AxiosError, { bankCode: string; accountNumber: string; accountName: string; amount: string; pin: string }>({
        mutationFn: withdrawToBank,
        onSuccess: (data) => {
            update({ showConfirmModal: false, step: 2, txnResult: data });
            setPin("");
        },
        onError: (error: AxiosError) => {
            update({ showConfirmModal: false, step: 2, txnResult: null });
            setPin("");
            const errData = error.response?.data as { message?: string };
            if (errData.message) {
                toast.error(errData.message);
            } else {
                toast.error("Withdrawal failed. Please try again.");
            }
        }
    });

    const { mutate: transferMutate, isPending: isTransferring } = useMutation<any, AxiosError, { beneficiary: string; amount: string; pin: string }>({
        mutationFn: transferFunds,
        onSuccess: (data) => {
            update({ showConfirmModal: false, step: 2, txnResult: data });
            setPin("");
        },
        onError: (error: AxiosError) => {
            update({ showConfirmModal: false, step: 2, txnResult: null });
            setPin("");
            const errData = error.response?.data as { message?: string };
            if (errData.message) {
                toast.error(errData.message);
            } else {
                toast.error("Transfer failed. Please try again.");
            }
        }
    });

    const isProcessing = isWithdrawingBank || isTransferring;

    const handleConfirm = () => {
        if (pin.length < 4) return;

        if (withdrawalType === "bank") {
            if (!selectedBank || !bank_account || !amount) return;

            if (save && accountName) {
                addAccount({ accountName, accountNumber: bank_account, bankCode: selectedBank.bankCode });
            }

            withdrawBankMutate({
                bankCode: selectedBank.bankCode,
                accountNumber: bank_account,
                accountName,
                amount,
                pin,
            });
        } else {
            if (!beneficiary || !amount) return;

            transferMutate({
                beneficiary,
                amount,
                pin,
            });
        }
    };

    return (
        <Dialog open={showConfirmModal} onOpenChange={(open) => !isProcessing && update({ showConfirmModal: open })}>
            <DialogContent className="sm:max-w-md md:max-w-lg w-[94%] max-h-[92vh] overflow-y-auto rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xl bg-white backdrop-blur-md">
                {!user?.pinActivatedAt ? (
                    <div className="py-4">
                        <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                            <Lock className="size-7" />
                        </div>
                        <DialogHeader className="mb-4 text-center">
                            <DialogTitle className="text-xl font-bold text-slate-900 text-center">Set Transaction PIN</DialogTitle>
                            <DialogDescription className="text-center text-slate-500 mt-1">
                                You need to set a transaction PIN first before making transfers.
                            </DialogDescription>
                        </DialogHeader>
                        <CustomButton variant="primary" href="/dashboard/settings/security" className="w-full mt-4 text-center">
                            Go to Security Settings
                        </CustomButton>
                    </div>
                ) : (
                    <div>
                        {/* Modal Header Badge */}
                        <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 text-blue-600 border border-blue-500/20 shadow-inner flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="size-7" />
                        </div>

                        <DialogHeader className="text-center">
                            <DialogTitle className="text-2xl font-display font-semibold text-slate-900 text-center">
                                Confirm {withdrawalType === "bank" ? "Withdrawal" : "Transfer"}
                            </DialogTitle>
                            <DialogDescription className="text-center text-slate-500 text-sm mt-1">
                                Please review your transfer details and authorize with your PIN
                            </DialogDescription>
                        </DialogHeader>

                        {/* Premium Transaction Summary Card */}
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 my-6 space-y-4 shadow-xs">
                            {/* Hero Amount Box */}
                            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center justify-center text-center">
                                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                                    Transfer Amount
                                </span>
                                <span className="text-3xl font-extrabold text-blue-600 font-display flex items-baseline gap-1">
                                    ₦{Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Detailed Rows */}
                            <div className="space-y-3 pt-1 text-sm">
                                {/* Recipient Name */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <div className="size-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <UserCheck className="size-4" />
                                        </div>
                                        <span>Recipient</span>
                                    </div>
                                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                                        {withdrawalType === "bank" ? (accountName || "N/A") : (beneficiaryName || beneficiary)}
                                    </span>
                                </div>

                                {/* Bank / Provider Name */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <div className="size-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <Building2 className="size-4" />
                                        </div>
                                        <span>{withdrawalType === "bank" ? "Bank Name" : "Platform"}</span>
                                    </div>
                                    <span className="font-semibold text-slate-800">
                                        {withdrawalType === "bank" ? selectedBank?.name : "PayMint"}
                                    </span>
                                </div>

                                {/* Account Number / Username */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <div className="size-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <CreditCard className="size-4" />
                                        </div>
                                        <span>{withdrawalType === "bank" ? "Account Number" : "Username / Email"}</span>
                                    </div>
                                    <span className="font-mono font-semibold text-slate-800 tracking-wider truncate max-w-[150px]">
                                        {withdrawalType === "bank" ? bank_account : beneficiary}
                                    </span>
                                </div>

                                {/* Processing Fee */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <div className="size-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                            <Sparkles className="size-4" />
                                        </div>
                                        <span>Processing Fee</span>
                                    </div>
                                    <span className="inline-flex items-center bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-200/60">
                                        Free
                                    </span>
                                </div>

                                <div className="border-t border-slate-200/70 pt-3 flex items-center justify-between font-semibold">
                                    <span className="text-slate-700">Total Debit</span>
                                    <span className="text-slate-900 text-base font-bold">
                                        ₦{Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* PIN Entry Section */}
                        <div className="w-full flex flex-col items-center">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Lock className="size-4 text-slate-600" />
                                <p className="text-sm font-semibold text-slate-800">Authorization PIN</p>
                            </div>
                            <p className="text-xs text-slate-500 text-center mb-4">
                                Enter your 4-digit transaction PIN to authorize this transfer
                            </p>
                            
                            <InputOTP
                                pattern={REGEXP_ONLY_DIGITS}
                                maxLength={4}
                                value={pin}
                                onChange={(v) => setPin(v)}
                                disabled={isProcessing}
                                autoFocus
                            >
                                <InputOTPGroup className="flex w-full justify-center gap-3 md:gap-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <InputOTPSlot
                                            key={index}
                                            className="border-2 border-slate-200 rounded-2xl size-14 md:size-16 text-2xl text-slate-800 font-bold bg-white shadow-xs transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                                            index={index}
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>

                            {/* Security Reassurance Pill */}
                            <div className="bg-emerald-50/70 border border-emerald-200/60 text-emerald-800 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-medium w-full mt-6 mb-2 shadow-2xs">
                                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                                <span>Protected with 256-bit bank-grade encryption</span>
                            </div>

                            {/* Action Buttons */}
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={pin.length < 4 || isProcessing}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 active:scale-[0.99] cursor-pointer"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin size-5" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm & Send
                                        <ArrowRight className="size-5" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => update({ showConfirmModal: false })}
                                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 h-10 rounded-xl text-sm font-medium transition-colors mt-2 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmWithdrawalModal;
