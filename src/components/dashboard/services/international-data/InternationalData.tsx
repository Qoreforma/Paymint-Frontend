import { useMemo } from "react";

import RecipientDetails from "./RecipientDetails";
import useIsMobile from "@/hooks/useIsMobile";
import Status from "./Status";
import ConfirmDataPayment from "./ConfirmDataPayment";
import usePurchaseIntDataStore from "@/stores/usePurchaseIntDataStore";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";

const InternationalData = () => {
  const isMobile = useIsMobile();

    const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
        queryKey: ["servicesStatus"],
        queryFn: getServicesStatus,
    });

    const statusMsg = servicesStatus?.internationaldata.status !== "active" ? servicesStatus?.internationaldata.message : null;
  
  const IntDataPurchaseSteps = useMemo(() =>
  [
    {
        id: 1,
        component: RecipientDetails
    },
    {
        id: 2,
        component: ConfirmDataPayment
    },
    {
        id: 3,
        component: Status
    },
], [])

    const {step, reset, update, phone, amount, country, provider, product} = usePurchaseIntDataStore();

    useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

    if (isMobile === null) return null;

    const CurrentComponent = IntDataPurchaseSteps[step - 1]?.component;

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;

    const summaryData = {
      "Service": "Int. Data",
      "Country": country?.name || "-",
      "Network": provider || "-",
      "Data Bundle": product?.name || "-",
      "Phone": phone || "-",
      "Amount": amount ? formatAmount(Number(amount)) : formatAmount(0),
      "Total": amount ? formatAmount(Number(amount)) : formatAmount(0),
    };
  
    return (
        <ServiceLayout
            step={step}
            totalSteps={2}
            serviceType="internationaldata"
            serviceTitle="International Data"
            summaryData={summaryData}
        >
            <div className="flex-1 flex flex-col justify-center">
                <CurrentComponent />
            </div>
        </ServiceLayout>
    )
}

export default InternationalData;