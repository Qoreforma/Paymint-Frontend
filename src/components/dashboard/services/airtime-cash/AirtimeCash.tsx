
import RecipientDetails from "./RecipientDetails";
import VerifyOTP from "./VerifyOTP";
import ConfirmAirtimePayment from "./ConfirmAirtimePayment";
import Status from "./Status";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import EmptyState from "../../EmptyState";
import Loader from "@/components/Loader";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";
import useServiceFlowStore from "@/stores/useServiceFlowStore";

const AirtimeCash = () => {
  const AirtimePurchaseSteps = [
    { id: 1, component: RecipientDetails },
    { id: 2, component: VerifyOTP },
    { id: 3, component: ConfirmAirtimePayment },
    { id: 4, component: Status },
  ];

  const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
      queryKey: ["servicesStatus"],
      queryFn: getServicesStatus,
  });

  const {step, reset, update, provider, phone, amount} = useServiceFlowStore();
  useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

  const CurrentComponent = AirtimePurchaseSteps[step - 1]?.component || AirtimePurchaseSteps[0].component;
  const statusMsg = servicesStatus?.airtime.status !== "active" ? servicesStatus?.airtime.message : null;

  if (isLoading) return <Loader className="w-full h-full" />;
  if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;

  const summaryData = {
    "Service": "Airtime To Cash",
    "Network": provider ? provider.toUpperCase() : "-",
    "Phone Number": phone ? phone : "-",
    "Airtime Value": amount ? formatAmount(Number(amount)) : formatAmount(0),
  };

  return (
    <ServiceLayout
      step={step}
      totalSteps={3}
      serviceType="airtime-cash"
      serviceTitle="Airtime to Cash"
      summaryData={summaryData}
    >
        <div className="flex-1 flex flex-col justify-center">
            <CurrentComponent />
        </div>
    </ServiceLayout>
  )
}

export default AirtimeCash;