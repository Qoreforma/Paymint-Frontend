import { create } from "zustand";

export interface TSmmTransaction {
  transaction: {
    id: string;
    _id: string;
    reference: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
    meta?: {
      productName?: string;
      serviceCategory?: string;
      link?: string;
      quantity?: number;
      chargeInfo?: {
        baseAmount?: number;
        serviceCharge?: number;
        totalAmount?: number;
      };
    };
  };
  providerOrderId: number;
  totalNgn: number;
  status: string;
}

export interface TSmmState {
  step: number;
  platform: string;
  platformName: string;
  platformLogo: string;
  productType: string;
  productId: string;
  productName: string;
  productRate: number; // rate per 1,000 units
  minQuantity: number;
  maxQuantity: number;
  link: string;
  quantity: number | "";
  amount: number; // calculated total in NGN

  txnResult: TSmmTransaction | null;
  errorMessage: string | null;

  update: (fields: Partial<Omit<TSmmState, "update" | "reset">>) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  platform: "",
  platformName: "",
  platformLogo: "",
  productType: "",
  productId: "",
  productName: "",
  productRate: 0,
  minQuantity: 10,
  maxQuantity: 100000,
  link: "",
  quantity: "" as const,
  amount: 0,

  txnResult: null,
  errorMessage: null,
};

const useSmmStore = create<TSmmState>((set) => ({
  ...initialState,

  update: (fields) => set((state) => ({ ...state, ...fields })),
  reset: () => set(initialState),
}));

export default useSmmStore;
