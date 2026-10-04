import { useMemo } from "react";
import RecipientDetails from "./RecipientDetails";
import ConfirmSmmPayment from "./ConfirmSmmPayment";
import Status from "./Status";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import useSmmStore from "@/stores/useSmmStore";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";

const Smm = () => {
  const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
    queryKey: ["servicesStatus"],
    queryFn: getServicesStatus,
  });

  const smmStatus = servicesStatus?.smm;
  const isInactive = smmStatus && smmStatus.status !== "active";
  const statusMsg = isInactive
    ? smmStatus.message || "Social Media Marketing service is currently unavailable. Please try again later."
    : null;

  const SmmSteps = useMemo(
    () => [
      { id: 1, component: RecipientDetails },
      { id: 2, component: ConfirmSmmPayment },
      { id: 3, component: Status },
    ],
    []
  );

  const { step, platformName, productName, link, quantity, amount } = useSmmStore();

  const CurrentComponent = SmmSteps[step - 1]?.component || SmmSteps[0].component;

  if (isLoading) return <Loader className="w-full h-full" />;

  if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;

  const summaryData: Record<string, string | number> = {
    "Service": "Social Media (SMM)",
    "Platform": platformName || "-",
    "Package": productName || "-",
    "Target Link": link || "-",
    "Quantity": quantity ? Number(quantity).toLocaleString() : "-",
    "Amount": amount ? formatAmount(amount) : formatAmount(0),
    "Total": amount ? formatAmount(amount) : formatAmount(0),
  };

  return (
    <ServiceLayout
      step={step}
      totalSteps={2}
      serviceType="smm"
      serviceTitle="Social Media"
      summaryData={summaryData}
    >
      <div className="flex-1 flex flex-col justify-center">
        <CurrentComponent />
      </div>
    </ServiceLayout>
  );
};

export default Smm;
