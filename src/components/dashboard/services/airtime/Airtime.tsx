import { useEffect } from "react";
import RecipientDetails from "./RecipientDetails";
import useServiceFlowStore from "@/stores/useServiceFlowStore";
import ConfirmAirtimePayment from "./ConfirmAirtimePayment";
import Status from "./Status";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, getCashbackRules, ServicesData } from "@/lib/api/dashboard-apis/generics";
import EmptyState from "../../EmptyState";
import Loader from "@/components/Loader";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";


const Airtime = () => {
  
  const AirtimePurchaseSteps = [
    { id: 1, component: RecipientDetails },
    { id: 2, component: ConfirmAirtimePayment },
    { id: 3, component: Status },
  ];
    
  const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
      queryKey: ["servicesStatus"],
      queryFn: getServicesStatus,
  });
  
  const { data: cashbackRules } = useQuery({
      queryKey: ["cashbackRules", servicesStatus?.airtime?._id],
      queryFn: () => getCashbackRules(servicesStatus?.airtime?._id as string),
      enabled: !!servicesStatus?.airtime?._id,
  });
  
  const {step, reset, update, provider, phone, amount} = useServiceFlowStore();

  useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

  useEffect(() => {
      if (cashbackRules && cashbackRules.length > 0) {
          update({ cashbackRule: cashbackRules[0] });
      }
  }, [cashbackRules, update]);

  const CurrentComponent = AirtimePurchaseSteps[step - 1]?.component || AirtimePurchaseSteps[0].component;


    const statusMsg = servicesStatus?.airtime.status !== "active" ? servicesStatus?.airtime.message : null;

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;
  
  const summaryData = {
    "Service": "Airtime Top Up",
    "Network": provider ? provider.toUpperCase() : "-",
    "Phone Number": phone ? phone : "-",
    "Amount": amount ? formatAmount(Number(amount)) : formatAmount(0),
    "Total": amount ? formatAmount(Number(amount)) : formatAmount(0)
  };

  return (
    <ServiceLayout
      step={step}
      totalSteps={2}
      serviceType="airtime"
      serviceTitle="Airtime"
      summaryData={summaryData}
    >
        <div className="flex-1 flex flex-col justify-center">
            <CurrentComponent />
        </div>
    </ServiceLayout>
  )
}

export default Airtime;