import { RecipientDetailFormSchema } from "@/lib/zodSchemas/dashboard.schema";
import useWithdrawFundsStore from "@/stores/useWithdrawFunds";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BsCheck2Circle } from "react-icons/bs";
import { motion } from "framer-motion";
import { z } from "zod";
import { 
  Building2, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  CreditCard, 
  Loader2, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

import Card from "@/assets/dashboard/Card.svg";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import CustomButton from "@/components/CustomButton";
import { fetchBankList, withdrawToBank } from "@/lib/api/dashboard-apis/walletApis";
import { cn } from "@/lib/utils";
import { TAccountVerResponse, verifyBankAccountPayload } from "../settings/AddNewBank";
import { addBankAccount, getSavedAccounts, verifyBankAccount } from "@/lib/api/dashboard-apis/settingsApis";
import { TSavedBankAccount } from "../settings/BankInfo";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/context/AuthContext";
import { TWithdrawToBankResponse } from "./ConfirmFundsWithdrawal";

export type TBank = {
    routingKey: string;
    name: string;
    bankCode: string;
    logoImage: string;
    categoryId: string;
    nubanCode: string;
    alias: string[];
};

type TFormData = z.infer<typeof RecipientDetailFormSchema>;

const RecipientDetailForm = () => {
    const { user } = useAuth();
    const [checked, setChecked] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showBanksDropdown, setShowBanksDropdown] = useState(false);
    const [pin, setPin] = useState("");

    const { update, amount, selectedBank, bank_account, accountName } = useWithdrawFundsStore();

    const { mutate: verifyAccountMutate, isPending: isVerifying, data: verifiedAccount, error: verAccError } = useMutation<TAccountVerResponse, AxiosError, verifyBankAccountPayload>({
        mutationFn: verifyBankAccount,
    });

    const { data: accounts } = useQuery<TSavedBankAccount[], Error>({
        queryKey: ["bank-accounts"],
        queryFn: getSavedAccounts,
    });

    const {
        data: banks,
        isLoading: fetchingBanks,
        error: fetchBankError
    } = useQuery<TBank[], Error>({
        queryKey: ["bank-list"],
        queryFn: fetchBankList,
    });

    const { mutate: addAccount } = useMutation({
        mutationFn: addBankAccount,
    });

    const { mutate: withdrawMutate, isPending: isWithdrawing } = useMutation<TWithdrawToBankResponse, AxiosError, { bankCode: string; accountNumber: string; accountName: string; amount: string; pin: string }>({
        mutationFn: withdrawToBank,
        onSuccess: (data) => {
            setShowConfirmModal(false);
            update({ step: 2, txnResult: data });
        },
        onError: (error: AxiosError) => {
            setShowConfirmModal(false);
            update({ step: 2, txnResult: null });
            const errData = error.response?.data as { message?: string };
            if (errData.message) {
                toast.error(errData.message);
            } else {
                toast.error("Withdrawal failed. Please try again.");
            }
        }
    });

    const {
        register,
        formState: { errors },
        watch,
        reset,
        setValue,
        handleSubmit
    } = useForm<TFormData>({
        resolver: zodResolver(RecipientDetailFormSchema),
        defaultValues: {
            amount: amount || "",
            account_no: bank_account || "",
        }
    });

    const accountNumber = watch("account_no");
    const amountVal = watch("amount");

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (accountNumber && accountNumber.length >= 8 && selectedBank) {
                verifyAccountMutate({ bankCode: selectedBank.bankCode, accountNumber });
            }
        }, 1000);

        return () => clearTimeout(delayDebounce);
    }, [verifyAccountMutate, accountNumber, selectedBank]);

    const onFormSubmit = (data: TFormData) => {
        const accName = verifiedAccount?.accountName || accountName || "";
        update({
            bank_account: data.account_no,
            accountName: accName,
            amount: data.amount,
            save: checked,
        });
        setPin("");
        setShowConfirmModal(true);
    };

    const handleConfirmWithdrawal = () => {
        if (!selectedBank || !accountNumber || !amountVal || pin.length < 4) return;

        const accName = verifiedAccount?.accountName || accountName || "";

        if (checked && accName) {
            addAccount({ accountName: accName, accountNumber, bankCode: selectedBank.bankCode });
        }

        withdrawMutate({
            bankCode: selectedBank.bankCode,
            accountNumber,
            accountName: accName,
            amount: amountVal,
            pin,
        });
    };

    const setSavedBank = (account: TSavedBankAccount) => {
        const savedBankDetails = banks?.find((bank) => bank.bankCode === account.bankCode);
        if (savedBankDetails) {
            update({ selectedBank: savedBankDetails, bank_account: account.accountNumber, accountName: account.accountName });
            reset({ amount: amountVal || amount, account_no: account.accountNumber });
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onFormSubmit)} className="w-full flex flex-col gap-6">
                {/* Bank selection */}
                <div className="w-full">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="account">Bank name</label>
                    <Popover open={showBanksDropdown} onOpenChange={setShowBanksDropdown}>
                        <PopoverTrigger asChild>
                            <CustomButton
                                disabled={fetchingBanks}
                                className="w-full h-14 border border-slate-200 rounded-xl px-4 bg-white outline-none hover:border-blue-500 font-normal text-slate-800 flex items-center justify-between text-sm shadow-sm transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    {selectedBank ? <span>{selectedBank.name}</span> : <span className="text-slate-400">{fetchingBanks ? "Loading banks..." : "Select bank"}</span>}
                                </div>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </CustomButton>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[90vw] md:w-[460px]">
                            <Command>
                                <CommandInput placeholder="Search bank..." />
                                <CommandList className="w-full px-3.5">
                                    <CommandEmpty>No bank found.</CommandEmpty>
                                    <CommandGroup className="px-0">
                                        {banks && banks.map((bank) => (
                                            <CommandItem
                                                className={cn("text-slate-700 justify-between cursor-pointer", selectedBank && bank.bankCode === selectedBank.bankCode && "font-medium")}
                                                key={bank.bankCode}
                                                value={bank.name}
                                                onSelect={(currentValue) => {
                                                    const bankDetails = banks.find((bnk) => bnk.name === currentValue);
                                                    const newBank = bankDetails === selectedBank ? null : bankDetails;
                                                    update({ selectedBank: newBank });
                                                    setShowBanksDropdown(false);
                                                }}
                                            >
                                                <span>{bank.name}</span>
                                                <Check className={cn("mr-2 h-4 w-4 text-blue-600", selectedBank?.bankCode === bank.bankCode ? "opacity-100" : "opacity-0")} />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <svg className="size-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Ensure the bank account name matches your PayMint account name
                    </p>
                    {fetchBankError && <p className="text-red-500 mt-1 text-sm">Failed to load banks. Please refresh.</p>}
                </div>

                {/* Account Number */}
                <div className="w-full">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="account">Account number</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input
                            {...register("account_no")}
                            placeholder="Enter account number"
                            className="w-full h-14 border border-slate-200 rounded-xl py-4 pl-11 pr-4 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 text-slate-800 transition-all shadow-sm"
                            type="text"
                            id="account"
                        />
                    </div>
                    {isVerifying && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2">
                            <Loader2 className="animate-spin size-4 text-blue-600" />
                            <span className="italic text-sm text-slate-500">Verifying account number</span>
                        </motion.div>
                    )}
                    {verifiedAccount && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex mt-2 items-center gap-2">
                            <div className="grid place-items-center size-5 rounded-full bg-green-500 text-white">
                                <BsCheck2Circle className="size-3" />
                            </div>
                            <p className="text-sm font-medium text-green-600">{verifiedAccount.accountName}</p>
                        </motion.div>
                    )}
                    {verAccError && <p className="text-red-500 text-sm mt-1">Something went wrong, please try again</p>}
                    {errors.account_no && <p className="text-red-500 text-sm mt-1">{errors.account_no.message}</p>}
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

                    <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input checked={checked} onChange={(e) => setChecked(e.target.checked)} type="checkbox" className="peer hidden" />
                        <div className="size-5 border border-blue-500 rounded-md transition-colors duration-200 flex items-center justify-center peer-checked:bg-blue-50 peer-checked:[&>svg]:opacity-100">
                            <Check className="size-4 text-blue-600 opacity-0 transition-opacity duration-200" />
                        </div>
                        <div>
                            <span className="text-slate-700 text-sm font-medium">Save for later</span>
                            <p className="text-xs text-slate-400">Save these withdrawal details for faster access next time.</p>
                        </div>
                    </label>
                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={!selectedBank || !accountNumber || !amountVal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    Proceed to Confirm
                    <ArrowRight className="size-4" />
                </button>

                {/* Saved bank accounts */}
                {accounts && accounts.length ? (
                    <>
                        <p className="text-slate-500 text-sm text-center mt-6 mb-2">or use a saved bank account</p>

                        {accounts.map((account) => (
                            <div
                                key={account._id}
                                onClick={() => setSavedBank(account)}
                                className={twMerge(
                                    "w-full flex items-center justify-between rounded-xl p-4 bg-slate-50 border border-slate-200 hover:border-blue-500 cursor-pointer transition",
                                    selectedBank?.bankCode === account.bankCode && "border-blue-500 bg-blue-50/30"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={Card} className="w-10 h-6 object-cover" alt="card" />
                                    <div className="flex flex-col">
                                        <p className="font-medium text-slate-800 text-sm">{account.accountName}</p>
                                        <p className="text-xs text-slate-500">{account.accountNumber} • {account.bankName}</p>
                                    </div>
                                </div>
                                <ChevronRight className="size-4 text-slate-400" />
                            </div>
                        ))}
                    </>
                ) : null}
            </form>

            {/* Premium Fintech Confirmation Modal */}
            <Dialog open={showConfirmModal} onOpenChange={(open) => !isWithdrawing && setShowConfirmModal(open)}>
                <DialogContent className="sm:max-w-md md:max-w-lg w-[94%] max-h-[92vh] overflow-y-auto rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xl bg-white backdrop-blur-md">
                    {!user?.pinActivatedAt ? (
                        <div className="py-4">
                            <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                                <Lock className="size-7" />
                            </div>
                            <DialogHeader className="mb-4 text-center">
                                <DialogTitle className="text-xl font-bold text-slate-900 text-center">Set Transaction PIN</DialogTitle>
                                <DialogDescription className="text-center text-slate-500 mt-1">
                                    You need to set a transaction PIN first before withdrawing funds.
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
                                    Confirm Withdrawal
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
                                        Withdrawal Amount
                                    </span>
                                    <span className="text-3xl font-extrabold text-blue-600 font-display flex items-baseline gap-1">
                                        ₦{Number(amountVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                            {verifiedAccount?.accountName || accountName || "N/A"}
                                        </span>
                                    </div>

                                    {/* Bank Name */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="size-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Building2 className="size-4" />
                                            </div>
                                            <span>Bank Name</span>
                                        </div>
                                        <span className="font-semibold text-slate-800">
                                            {selectedBank?.name}
                                        </span>
                                    </div>

                                    {/* Account Number */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="size-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <CreditCard className="size-4" />
                                            </div>
                                            <span>Account Number</span>
                                        </div>
                                        <span className="font-mono font-semibold text-slate-800 tracking-wider">
                                            {accountNumber}
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
                                            ₦{Number(amountVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                    Enter your 4-digit transaction PIN to authorize this withdrawal
                                </p>
                                
                                <InputOTP
                                    pattern={REGEXP_ONLY_DIGITS}
                                    maxLength={4}
                                    value={pin}
                                    onChange={(v) => setPin(v)}
                                    disabled={isWithdrawing}
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
                                    onClick={handleConfirmWithdrawal}
                                    disabled={pin.length < 4 || isWithdrawing}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 active:scale-[0.99] cursor-pointer"
                                >
                                    {isWithdrawing ? (
                                        <>
                                            <Loader2 className="animate-spin size-5" />
                                            Processing Withdrawal...
                                        </>
                                    ) : (
                                        <>
                                            Confirm & Withdraw
                                            <ArrowRight className="size-5" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    disabled={isWithdrawing}
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 h-10 rounded-xl text-sm font-medium transition-colors mt-2 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RecipientDetailForm;