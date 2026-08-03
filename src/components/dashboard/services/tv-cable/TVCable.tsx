import useTVCableStore from "@/stores/useTVCableStore";

import { TVCableServiceSteps } from "./constants";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";


const TVCable = () => {
    const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
        queryKey: ["servicesStatus"],
        queryFn: getServicesStatus,
    });

    const statusMsg = servicesStatus?.cable_tv.status !== "active" ? servicesStatus?.cable_tv.message : null;

    const {step, reset, update, provider, smartCardNo, package: storePackage} = useTVCableStore();
    
    useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;

    const summaryData = {
      "Service": "TV Cable Subscription",
      "Provider": provider?.name || "-",
      "Smart Card Number": smartCardNo || "-",
      "Package": storePackage?.name || "-",
      "Amount": storePackage?.amount ? formatAmount(storePackage.amount) : formatAmount(0),
      "Total": storePackage?.amount ? formatAmount(storePackage.amount) : formatAmount(0),
    };
          
    const CurrentComponent = TVCableServiceSteps[step - 1]?.component || TVCableServiceSteps[0].component;
    
    return (
        <ServiceLayout
            step={step}
            totalSteps={2}
            serviceType="tv-cable"
            serviceTitle="TV Cable"
            summaryData={summaryData}
        >
            <div className="flex-1 flex flex-col justify-center">
                <CurrentComponent />
            </div>
        </ServiceLayout>
      )
}

export default TVCable;