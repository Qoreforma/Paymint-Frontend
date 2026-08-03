import { create } from "zustand";

export type AirtimePrintTxnResponse = {
  id: string;
  reference: string;
  amount: number;
  direction: "DEBIT" | "CREDIT";
  type: string;
  status: string;
  purpose: string;
  provider: string;
  providerReference: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
};

type TAirtimePrint = {
    step: number;
    network: string;
    denomination: number | null;
    quantity: number;

    txnResult: null | AirtimePrintTxnResponse;
    
    update: (fields: Partial<Omit<TAirtimePrint, "update" | "reset">>) => void;
    reset: () => void;
}

const initialState = {
    step: 1,
    network: "",
    denomination: null,
    quantity: 1,
    txnResult: null
}

const useAirtimePrintStore = create<TAirtimePrint>((set) => ({
    ...initialState,

    update: (fields) => set((state) => ({ ...state, ...fields})),
    reset: () => set(initialState)
}))

export default useAirtimePrintStore;
