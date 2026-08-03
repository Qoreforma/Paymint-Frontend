import SelectProvider from "./SelectProvider";
import useEpinStore from "@/stores/useEPinStore";
import { useMemo } from "react";
import ConfirmEPinPayment from "./ConfirmEPinPayment";
import Status from "./Status";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount } from "@/lib/utils";

const Epin = () => {
    const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
        queryKey: ["servicesStatus"],
        queryFn: getServicesStatus,
    });

    const statusMsg = servicesStatus?.education.status !== "active" ? servicesStatus?.education.message : null;

    const EpinServiceSteps = useMemo(() => [
        {
            id: 1,
            component: SelectProvider
        },
        {
            id: 2,
            component: ConfirmEPinPayment
        },
        {
            id: 3,
            component: Status
        },
    ], [])

    const {step, reset, update, selectedProduct, selectedProvider, examNumber} = useEpinStore();

    useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;
    
    const summaryData = {
      "Service": "E-Pin Purchase",
      "Provider": selectedProvider?.name || "-",
      "Product": selectedProduct?.name || "-",
      "Candidate Details": examNumber || "-",
      "Amount": selectedProduct?.amount ? formatAmount(selectedProduct.amount) : formatAmount(0),
      "Total": selectedProduct?.amount ? formatAmount(selectedProduct.amount) : formatAmount(0),
    };

    const CurrentComponent = EpinServiceSteps[step - 1]?.component;
    
    return (
        <ServiceLayout
            step={step}
            totalSteps={2}
            serviceType="epin"
            serviceTitle="E-Pin"
            summaryData={summaryData}
        >
            <div className="flex-1 flex flex-col justify-center">
                <CurrentComponent />
            </div>
        </ServiceLayout>
      )
}

export default Epin;