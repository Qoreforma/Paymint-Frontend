import { QueryFunction } from "@tanstack/react-query";
import api from "../axios";
import { verifyBetWalletPayload } from "@/components/dashboard/services/betting/RecipientDetails";
import { SmartCardNoVerificationResponse, TvProductType, VerifySmartCardPayload } from "@/components/dashboard/services/tv-cable/RecipientDetails";
import { EpinProductType, VerifyJambNoPayload } from "@/components/dashboard/services/epin/SelectProvider";
import { VerifyPhoneNoPayload } from "@/components/dashboard/services/airtime/RecipientDetails";
import { AirtimeProviderType } from "@/components/dashboard/services/international-airtime/RecipientDetails";
import { DataProviderType, TDataProduct } from "@/components/dashboard/services/international-data/RecipientDetails";

export interface IDataPlan {
  id: string;
  name: string;
  code: string;
  dataType: string;
  validity: string;
  service: string;
  amount: number;
  logo: string;
}

export type TDataServiceProvider = {
  id: string;
  name: string;
  code: string;
  logo: string;
  serviceTypeCode: string;
  paymentOptions: string[];
};

export type TAirtimeServiceProvider = {
  id: string;
  name: string;
  code: string;
  logo: string;
  serviceTypeCode: string;
  paymentOptions: string[];
};

// AIRTIME
export const fetchAirtimeProviders = async () => {
    const res = await api.get("/airtime/providers")
    return res.data.data;
}

export const buyAirtime = async (payload: {phone: string, amount: string, provider: string, pin: string, is_ported?: boolean, useCashback?: boolean}) => {
    const res = await api.post("/airtime", payload)
    return res.data.data;
}

export const verifyPhoneNumber = async (payload: VerifyPhoneNoPayload) => {
    const res = await api.post("/airtime/verify-number", payload)
    return res.data?.data;
}

export const fetchDataProviders = async () => {
    const res = await api.get("/data/providers")
    return res.data.data;
}

export const fetchDataPlans: QueryFunction<IDataPlan[], [_: string, providerId: string, type: "DIRECT" | "SME"]> = async ({
  queryKey,
}) => {
  const [, providerId, type] = queryKey;
  const res = await api.get(`/data/${providerId}/${type}`);
  return res.data.data;
};

export const fetchAllDataPlans: QueryFunction<IDataPlan[], [_: string, providerId: string]> = async ({
  queryKey,
}) => {
  const [, providerId] = queryKey;
  
  // Fetch both DIRECT and SME plans in parallel
  const [directRes, smeRes] = await Promise.all([
    api.get(`/data/${providerId}/DIRECT`).catch(() => ({ data: { data: [] } })),
    api.get(`/data/${providerId}/SME`).catch(() => ({ data: { data: [] } }))
  ]);
  
  const directPlans = Array.isArray(directRes.data?.data) ? directRes.data.data : [];
  const smePlans = Array.isArray(smeRes.data?.data) ? smeRes.data.data : [];
  
  // Merge the lists
  return [...directPlans, ...smePlans];
};

export const buyData = async (prop: {phone: string, productId: string, pin: string, type: "DIRECT" | "SME", useCashback?: boolean}) => {
    const {phone, productId, pin, type, useCashback} = prop;
    const payload = {phone, productId, pin, type, useCashback};

    const res = await api.post(`/data`, payload)
    return res.data.data;
}

export const fetchElectricityProviders = async () => {
    const res = await api.get("/electricity/providers")
    return res.data.data;
}

export const verifyMeterNumber = async (payload: {providerCode: string, type: string, number: string}) => {
    const res = await api.post("/electricity/verify", payload)
    return res.data.data;
}

export const buyUnit = async (payload: {providerId: string, type: string, number: string, amount: string, pin: string}) => {
    const res = await api.post("/electricity", payload)
    return res.data.data;
}

export const fetchBettingProviders = async () => {
    const res = await api.get("/betting/providers")
    return res.data.data;
}

export const verifyBettingWalletNumber = async (payload: verifyBetWalletPayload) => {
    const res = await api.post("/betting/verify", payload)
    return res.data.data;
}

export const fundBettingWallet = async (payload: {providerId: string, number: string, amount: string, pin: string}) => {
    const res = await api.post("/betting", payload)
    return res.data.data;
}

export const fetchTvProviders = async () => {
    const res = await api.get("/tv-subscription")
    return res.data.data;
}

export const getTvProducts: QueryFunction<TvProductType[], [_: string, providerId: string]> = async ({queryKey}) => {
    const [, providerId] = queryKey;
    const res = await api.get(`/tv-subscription/${providerId}`)
    return res.data.data;
}

export const verifySmartcardNumber = async (payload: VerifySmartCardPayload): Promise<SmartCardNoVerificationResponse> => {
    const res = await api.post("/tv-subscription/verify", payload)
    return res.data.data;
}

export const subscribeToTv = async (payload: {provider: string, number: string, type: string, pin: string, productId: string}) => {
    const res = await api.post("/tv-subscription", payload)
    return res.data.data;
}

export const fetchEpinProviders = async () => {
    const res = await api.get("/e-pin")
    return res.data.data;
}

export const getEpinProducts: QueryFunction<EpinProductType[], [_: string, providerId: number]> = async ({queryKey}) => {
    const [, providerId] = queryKey;
    const res = await api.get(`/e-pin/${providerId}`)
    return res.data.data;
}

export const buyPin = async (payload: {productId: string, number?: string, pin: string}) => {
    const res = await api.post("/e-pin", payload);
    return res.data.data;
}

export const verifyJambNumber = async (payload: VerifyJambNoPayload) => {
    const res = await api.post("/e-pin/verify", payload)
    return res.data.data;
}

// International Airtime
export const fetchIntCountries = async () => {
    const res = await api.get("/international-airtime/countries")
    return res.data.data;
}

export const fetchIntAirtimeProviders: QueryFunction<AirtimeProviderType[], [_: string, countryCode: string]> = async ({queryKey}) => {
    const [, countryCode] = queryKey;
    const res = await api.get(`/international-airtime/providers/${countryCode}`)
    return res.data.data;
}

export const buyIntAirtime = async (payload: {phone: string, amount: string, countryCode: string, operatorId: string, pin: string}) => {
    const res = await api.post("/international-airtime", payload)
    return res.data.data;
}

// International Data
export const fetchIntDataCountries = async () => {
    const res = await api.get("/international-data/countries")
    return res.data.data;
}

export const fetchIntDataProviders: QueryFunction<DataProviderType[], [_: string, countryCode: string]> = async ({queryKey}) => {
    const [, countryCode] = queryKey;
    const res = await api.get(`/international-data/providers/${countryCode}`)
    return res.data.data;
}

export const fetchIntDataProducts: QueryFunction<TDataProduct, [_: string, providerId: string]> = async ({queryKey}) => {
    const [, providerId] = queryKey;
    const res = await api.get(`/international-data/products/${providerId}`)
    return res.data.data;
}

export const buyIntData = async (payload: {phone: string, amount: string, countryCode: string, operatorId: string, productCode: string, pin: string}) => {
    const res = await api.post("/international-data", payload)
    return res.data.data;
}

// Airtime Print (EPIN)
export const buyAirtimeEpin = async (payload: {network: string, denomination: number, quantity: number, pin: string}) => {
    const res = await api.post("/airtime/epin", payload);
    return res.data.data;
}

export const getAirtimeEpinReceipt = async (reference: string) => {
    const res = await api.get(`/airtime/epin/${reference}`);
    return res.data.data;
}

// Data Print (EPIN)
export const fetchDataEpinProducts: QueryFunction<any[], any> = async ({queryKey}) => {
    const [, serviceId] = queryKey;
    const res = await api.get(`/data/epin/products/${serviceId}`);
    return res.data.data;
}

export const buyDataEpin = async (payload: {productId: string, quantity: number, pin: string}) => {
    const res = await api.post("/data/epin", payload);
    return res.data.data;
}

export const getDataEpinReceipt = async (reference: string) => {
    const res = await api.get(`/data/epin/${reference}`);
    return res.data.data;
}