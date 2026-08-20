import { useEffect, useMemo } from "react";
import RecipientDetails from "./RecipientDetails";
import ConfirmDataPayment from "./ConfirmDataPayment";
import Status from "./Status";
import { useQuery } from "@tanstack/react-query";
import { getCashbackRules, getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import Loader from "@/components/Loader";
import EmptyState from "../../EmptyState";
import useServiceFlowStore from "@/stores/useServiceFlowStore";
import { useServiceURLSync } from "@/hooks/useServiceURLSync";
import ServiceLayout from "../shared/ServiceLayout";
import { formatAmount, convertToLocalPhoneNumber } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";


const Data = () => {
    
    const { data: servicesStatus, isLoading } = useQuery<ServicesData, Error>({
        queryKey: ["servicesStatus"],
        queryFn: getServicesStatus,
    });
    
    const { data: cashbackRules } = useQuery({
        queryKey: ["cashbackRules", servicesStatus?.data?._id],
        queryFn: () => getCashbackRules(servicesStatus?.data?._id as string),
        enabled: !!servicesStatus?.data?._id,
    });
    
    const statusMsg = servicesStatus?.data.status !== "active" ? servicesStatus?.data.message : null;
    
    const DataServiceSteps = useMemo(() => [
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
    
    const {step, reset, update, provider, phone, amount, plan, dataPlans} = useServiceFlowStore();

    useServiceURLSync({ step, updateStep: (s) => update({ step: s }), reset });

    useEffect(() => {
        if (cashbackRules && cashbackRules.length > 0) {
            update({ cashbackRule: cashbackRules[0] });
        }
    }, [cashbackRules, update]);

    const CurrentComponent = DataServiceSteps[step - 1].component;

    if (isLoading) return <Loader className="w-full h-full" />;

    if (statusMsg) return <EmptyState showBackBtn={true} text={statusMsg} />;
    
    const { user } = useAuth();
    const displayPhone = phone || (user?.phone ? convertToLocalPhoneNumber(user.phone) : "-");

    const selectedPlan = dataPlans?.find((p: any) => 
        (p.id || p._id || "").toString() === (plan || "").toString()
    );
    const summaryAmount = selectedPlan?.amount !== undefined ? Number(selectedPlan.amount) : (amount ? Number(amount) : 0);
    const summaryData = {
      "Service": "Data Subscription",
      "Network": provider ? provider.toUpperCase() : "-",
      "Plan": selectedPlan?.name ? selectedPlan.name : "-",
      "Phone Number": displayPhone,
      "Amount": formatAmount(summaryAmount),
      "Total": formatAmount(summaryAmount)
    };
          
    return (
        <ServiceLayout
          step={step}
          totalSteps={2}
          serviceType="data"
          serviceTitle="Data"
          summaryData={summaryData}
        >
            <div className="flex-1 flex flex-col justify-center">
                <CurrentComponent />
            </div>
        </ServiceLayout>
      )
}

export default Data;