import api from "../axios";

export type ServiceStatus =
  | "active"
  | "deactivated"
  | "coming-soon";

export interface ServiceInfo {
  _id: string;
  status: ServiceStatus;
  message: string | null;
}

export interface ServicesData {
  data: ServiceInfo;
  airtime: ServiceInfo;
  airtime_cash: ServiceInfo;
  cable_tv: ServiceInfo;
  electricity: ServiceInfo;
  education: ServiceInfo;
  betting: ServiceInfo;
  deposit: ServiceInfo;
  internationalairtime: ServiceInfo;
  internationaldata: ServiceInfo;
  giftcard: ServiceInfo;
  hotel: ServiceInfo;
  withdrawal: ServiceInfo;
}


export const getServicesStatus = async () => {
    const res = await api.get("/reference/service-types-status");
    return res.data.data;
}

export const getCashbackRules = async (serviceTypeId?: string) => {
    const params = new URLSearchParams();
    params.append("active", "true");
    if (serviceTypeId) {
        params.append("serviceTypeId", serviceTypeId);
    }
    const res = await api.get(`/reference/cashback-rules?${params.toString()}`);
    return res.data.data;
}