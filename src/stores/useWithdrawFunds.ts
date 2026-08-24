import { TWithdrawToBankResponse } from "@/components/dashboard/withdraw-funds/ConfirmFundsWithdrawal";
import { TBank } from "@/components/dashboard/withdraw-funds/RecipientDetailForm";
import { create } from "zustand";

type TWithdrawFunds = {
    step: number;
    withdrawalType: "bank" | "internal";
    
    // Bank Transfer Fields
    selectedBank: TBank | null;
    bank_account: string;
    accountName: string;
    
    // Internal Transfer Fields
    beneficiary: string;
    beneficiaryName: string;
    
    // Shared Fields
    amount: string;
    note: string;
    save: boolean;
    showConfirmModal: boolean;

    txnResult: TWithdrawToBankResponse | null;
    
    update: (fields: Partial<Omit<TWithdrawFunds, "update">>) => void;
    reset: () => void;
}

const initialState: Omit<TWithdrawFunds, "update" | "reset"> = {
    step: 1,
    withdrawalType: "bank",
    
    selectedBank: null,
    bank_account: "",
    accountName: "",
    
    beneficiary: "",
    beneficiaryName: "",
    
    amount: "",
    note: "",
    save: false,
    showConfirmModal: false,

    txnResult: null
}

const useWithdrawFundsStore = create<TWithdrawFunds>((set) => ({
    ...initialState,

    update: (fields) => set((state) => ({ ...state, ...fields})),
    reset: () => set(initialState)
}))

export default useWithdrawFundsStore;