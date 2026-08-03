import useWithdrawFundsStore from "@/stores/useWithdrawFunds";
import TransactionStatus from "../shared/TransactionStatus";
import { Landmark, User, CreditCard } from "lucide-react";

const Status = () => {
    const { txnResult, reset, amount, accountName, bank_account, selectedBank } = useWithdrawFundsStore();

    const statusStr = txnResult ? (txnResult.status || "success") : "failed";
    const refCode = txnResult?.reference || "";

    const detailItems = [
        {
            label: "Bank Name",
            value: selectedBank?.name || "Bank",
            icon: <Landmark className="size-4" />,
        },
        {
            label: "Account Number",
            value: bank_account || "—",
            icon: <CreditCard className="size-4" />,
            isCopyable: true,
        },
        ...(accountName ? [{
            label: "Recipient Name",
            value: accountName,
            icon: <User className="size-4" />,
        }] : []),
    ];

    return (
        <TransactionStatus
            status={statusStr}
            amount={amount || 0}
            transactionType="Bank Withdrawal"
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