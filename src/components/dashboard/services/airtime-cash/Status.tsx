import useServiceFlowStore from "@/stores/useServiceFlowStore";
import { useTransactionSocket } from "@/hooks/useTransactionSocket";
import TransactionStatus from "@/components/dashboard/shared/TransactionStatus";
import { Phone, Wifi } from "lucide-react";

const Status = () => {
    const { txnResult, reset, amount, phone, provider } = useServiceFlowStore();
    
    // Wire in websocket for real-time updates
    const { status: socketStatus } = useTransactionSocket(txnResult?.result?.reference || null);

    // Determine the current effective status.
    const currentStatus = socketStatus || txnResult?.result?.status || "failed";
    const refCode = txnResult?.result?.reference || "";

    const detailItems = [
        {
            label: "Phone Number",
            value: phone || "—",
            icon: <Phone className="size-4" />,
            isCopyable: true,
        },
        ...(provider ? [{
            label: "Network Provider",
            value: provider.toUpperCase(),
            icon: <Wifi className="size-4" />,
        }] : []),
    ];

    return (
        <TransactionStatus
            status={currentStatus}
            amount={amount || 0}
            transactionType="Airtime to Cash"
            reference={refCode}
            date={txnResult?.result?.createdAt}
            details={detailItems}
            receiptUrl={refCode ? `/receipt?txnId=${refCode}` : undefined}
            onReset={reset}
            onRetry={reset}
        />
    );
};

export default Status;