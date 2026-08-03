import useTransferFundsStore from "@/stores/useTransferFundsStore";
import TransactionStatus from "../shared/TransactionStatus";
import { User, Send } from "lucide-react";

const Status = () => {
    const { txnResult, amount, user, reset } = useTransferFundsStore();

    const statusStr = txnResult ? (txnResult.status || "success") : "failed";
    const refCode = txnResult?.reference || "";

    const detailItems = [
        ...(user ? [{
            label: "Recipient Username",
            value: `@${user.replace(/^@/, '')}`,
            icon: <User className="size-4" />,
            isCopyable: true,
        }] : []),
        {
            label: "Transfer Method",
            value: "PayMint Wallet Transfer",
            icon: <Send className="size-4" />,
        },
    ];

    return (
        <TransactionStatus
            status={statusStr}
            amount={amount || 0}
            transactionType="Wallet Transfer"
            reference={refCode}
            date={txnResult?.createdAt}
            details={detailItems}
            receiptUrl={refCode ? `/receipt?txnId=${refCode}` : undefined}
            onReset={reset}
            onRetry={reset}
        />
    );
};

export default Status;