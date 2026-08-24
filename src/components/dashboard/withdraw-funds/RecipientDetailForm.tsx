import { RecipientDetailFormSchema } from "@/lib/zodSchemas/dashboard.schema";
import useWithdrawFundsStore from "@/stores/useWithdrawFunds";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BsCheck2Circle } from "react-icons/bs";
import { motion } from "framer-motion";
import { z } from "zod";
import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Loader2, 
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
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

import CustomButton from "@/components/CustomButton";
import { fetchBankList, withdrawToBank } from "@/lib/api/dashboard-apis/walletApis";
import { cn } from "@/lib/utils";
import { TAccountVerResponse, verifyBankAccountPayload } from "../settings/AddNewBank";
import { addBankAccount, getSavedAccounts, verifyBankAccount } from "@/lib/api/dashboard-apis/settingsApis";
import { TSavedBankAccount } from "../settings/BankInfo";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/context/AuthContext";

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
    const [showBanksDropdown, setShowBanksDropdown] = useState(false);

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
            showConfirmModal: true,
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
        </>
    );
};

export default RecipientDetailForm;