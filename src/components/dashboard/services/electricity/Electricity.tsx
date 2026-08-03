import { useMemo } from "react";

import useElectricityBillsStore from "@/stores/useElectricityBillsStore";
import RecipientDetails from "./RecipientDetails";
import ConfirmElectricityPayment from "./ConfirmElectricityPayment";
import Status from "./Status";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";

const Electricity = () => {    
    const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
        queryKey: ["servicesStatus"],
        queryFn: getServicesStatus,
    });

    const statusMsg = servicesStatus?.electricity.status !== "active" ? servicesStatus?.electricity.message : null;

    const ElectricityBillsSteps = useMemo(() => [
      {
          id: 1,
          component: RecipientDetails
      },
      {
          id: 2,
          component: ConfirmElectricityPayment
      },
      {
          id: 3,
          component: Status
      },
    ], [])

    const {step, reset, update, provider, meterType, meterNumber, quantity} = useElectricityBillsStore();
  
    useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

    const CurrentComponent = ElectricityBillsSteps[step - 1]?.component || ElectricityBillsSteps[0].component;

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;

    const summaryData = {
      "Service": "Electricity Bill",
      "Provider": provider ? provider.toUpperCase() : "-",
      "Meter Type": meterType ? meterType.charAt(0).toUpperCase() + meterType.slice(1) : "-",
      "Meter Number": meterNumber ? meterNumber : "-",
      "Amount": quantity ? formatAmount(Number(quantity)) : formatAmount(0),
      "Total": quantity ? formatAmount(Number(quantity)) : formatAmount(0)
    };

    return (
        <ServiceLayout
            step={step}
            totalSteps={2}
            serviceType="electricity"
            serviceTitle="Electricity"
            summaryData={summaryData}
        >
            <div className="flex-1 flex flex-col justify-center">
                <CurrentComponent />
            </div>
        </ServiceLayout>
      )
}

export default Electricity