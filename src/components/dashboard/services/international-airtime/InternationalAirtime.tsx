import { useMemo } from "react";

import RecipientDetails from "./RecipientDetails";
import useIsMobile from "@/hooks/useIsMobile";
import ConfirmAirtimePayment from "./ConfirmAirtimePayment";
import Status from "./Status";
import usePurchaseIntAirtimeStore from "@/stores/usePurchaseIntAirtimeStore";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";

const InternationalAirtime = () => {
  const isMobile = useIsMobile();

    const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
        queryKey: ["servicesStatus"],
        queryFn: getServicesStatus,
    });

    const statusMsg = servicesStatus?.internationalairtime.status !== "active" ? servicesStatus?.internationalairtime.message : null;
  
  const IntAirtimePurchaseSteps = useMemo(() =>
  [
    {
        id: 1,
        component: RecipientDetails
    },
    {
        id: 2,
        component: ConfirmAirtimePayment
    },
    {
        id: 3,
        component: Status
    },
], [])

    const {step, reset, update, phone, amount, country, provider} = usePurchaseIntAirtimeStore();

    useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

    if (isMobile === null) return null;

    const CurrentComponent = IntAirtimePurchaseSteps[step - 1]?.component;

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;

    const summaryData = {
      "Service": "Int. Airtime",
      "Country": country?.name || "-",
      "Network": provider || "-",
      "Phone": phone || "-",
      "Amount": amount ? formatAmount(Number(amount)) : formatAmount(0),
      "Total": amount ? formatAmount(Number(amount)) : formatAmount(0),
    };
  
    return (
        <ServiceLayout
            step={step}
            totalSteps={2}
            serviceType="internationalairtime"
            serviceTitle="International Airtime"
            summaryData={summaryData}
        >
            <div className="flex-1 flex flex-col justify-center">
                <CurrentComponent />
            </div>
        </ServiceLayout>
    )
}

export default InternationalAirtime;