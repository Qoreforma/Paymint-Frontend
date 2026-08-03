import { create } from "zustand";

export type CashbackRule = {
  _id: string;
  serviceTypeId: string;
  type: "flat" | "percentage";
  value: number;
  active: boolean;
};

export type GenericTransactionResult = any; // Will hold the generic transaction response

type TServiceFlowState = {
    step: number;
    
    provider: string;
    phone: string;
    amount: string;
    accountName: string;
    bank_account: string;
    
    // Data specific
    providerName: string;
    providerId: string | null;
    type: "DIRECT" | "SME";
    plan: string;
    dataPlans: any[];
    
    // Generic form fields (for other custom stuff)
    formData: Record<string, any>;
    
    txnResult: GenericTransactionResult | null;
    
    cashbackRule: CashbackRule | null;
    useCashback: boolean;
    
    update: (fields: Partial<Omit<TServiceFlowState, "update" | "reset" | "setFormData">>) => void;
    setFormData: (fields: Record<string, any>) => void;
    reset: () => void;
}

const initialState = {
    step: 1,
    provider: "",
    phone: "",
    amount: "",
    accountName: "",
    bank_account: "",
    
    providerName: "",
    providerId: null,
    type: "DIRECT" as const,
    plan: "",
    dataPlans: [],
    
    formData: {},
    txnResult: null,
    cashbackRule: null,
    useCashback: false,
}

const useServiceFlowStore = create<TServiceFlowState>((set) => ({
    ...initialState,

    update: (fields) => set((state) => ({ ...state, ...fields})),
    setFormData: (fields) => set((state) => ({ ...state, formData: { ...state.formData, ...fields } })),
    reset: () => set(initialState)
}))

export default useServiceFlowStore;
