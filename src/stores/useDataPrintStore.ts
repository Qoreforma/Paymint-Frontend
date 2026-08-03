import { create } from "zustand";

export type DataPrintTxnResponse = {
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

export type DataPrintProviderType = {
    id: string | number;
    name: string;
    code: string;
    logo: string;
}

export type DataPrintProductType = {
    id: string;
    name: string;
    code: string;
    amount: number;
    logo?: string;
}

type TDataPrint = {
    step: number;
    selectedProvider: DataPrintProviderType | null;
    selectedProduct: DataPrintProductType | null;
    quantity: number;

    txnResult: null | DataPrintTxnResponse;
    
    update: (fields: Partial<Omit<TDataPrint, "update" | "reset">>) => void;
    reset: () => void;
}

const initialState = {
    step: 1,
    selectedProvider: null,
    selectedProduct: null,
    quantity: 1,
    txnResult: null
}

const useDataPrintStore = create<TDataPrint>((set) => ({
    ...initialState,

    update: (fields) => set((state) => ({ ...state, ...fields})),
    reset: () => set(initialState)
}))

export default useDataPrintStore;
