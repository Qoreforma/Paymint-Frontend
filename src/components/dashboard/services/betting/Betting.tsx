import { useMemo } from "react";

import useBettingStore from "@/stores/useBettingStore";
import RecipientDetails from "./RecipientDetails";
import ConfirmBettingPayment from "./ConfirmBettingPayment";
import Status from "./Status";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";


const Betting = () => {
    const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
        queryKey: ["servicesStatus"],
        queryFn: getServicesStatus,
    });

    const statusMsg = servicesStatus?.betting.status !== "active" ? servicesStatus?.betting.message : null;

    
    const BettingServiceSteps = useMemo(() => [
      {
          id: 1,
          component: RecipientDetails
      },
      {
          id: 2,
          component: ConfirmBettingPayment
      },
      {
          id: 3,
          component: Status
      },
    ], [])
    
    const {step, reset, update, provider, user, amount} = useBettingStore();
    
    useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;

    const summaryData = {
      "Service": "Betting Top-up",
      "Provider": provider || "-",
      "Customer ID": user || "-",
      "Amount": amount ? formatAmount(Number(amount)) : formatAmount(0),
      "Total": amount ? formatAmount(Number(amount)) : formatAmount(0),
    };
          
    const CurrentComponent = BettingServiceSteps[step - 1]?.component || BettingServiceSteps[0].component;
    
    return (
        <ServiceLayout
            step={step}
            totalSteps={2}
            serviceType="betting"
            serviceTitle="Betting"
            summaryData={summaryData}
        >
            <div className="flex-1 flex flex-col justify-center">
                <CurrentComponent />
            </div>
        </ServiceLayout>
      )
}

export default Betting;