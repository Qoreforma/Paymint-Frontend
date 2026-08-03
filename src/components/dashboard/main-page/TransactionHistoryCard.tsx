import { Transaction } from "@/lib/api/dashboard-apis/txnHistoryApis";
import { formatAmount } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Smartphone, Globe, Zap, Tv, Receipt } from "lucide-react";

type TTransactionHistoryCard = {
  transaction: Transaction & { direction?: string, metadata?: any };
}

const TransactionHistoryCard = ({transaction}: TTransactionHistoryCard) => {

  const txnProduct = transaction?.metadata?.serviceName
  const serviceCode = transaction?.metadata?.serviceCode
  const txnDirection = transaction?.direction;
  const productName = txnProduct?.includes("-") ? txnProduct.split("-")[0].trim() : txnProduct;

  const accountNumber = transaction?.metadata?.accountNumber;
  const bankName = transaction?.metadata?.bankName;
  const bankTransferRecepient = bankName && accountNumber ? `${accountNumber} / ${bankName}` : null;
  const recipientName = transaction?.metadata?.recipientName;
  const senderUsername = transaction?.metadata?.senderUsername;
  const service = productName || serviceCode || bankTransferRecepient || recipientName || senderUsername || "Transaction";

  const purpose = transaction?.purpose || "";

  const status = transaction?.status || "";
  
  // Design Specific Styling
  const isSuccess = status === "success" || status === "successful";
  const isReversed = status === "reversed";
  const isFailed = status === "failed";
  
  const statusColor = isSuccess ? "text-green-600" : isReversed || isFailed ? "text-red-500" : "text-amber-500";
  const isCredit = txnDirection === "CREDIT" || isReversed;
  const amountColor = isCredit ? "text-green-600" : "text-slate-800";

  // Map icons based on purpose or service name
  let Icon = Receipt;
  let iconBg = "bg-slate-50";
  let iconColor = "text-slate-500";

  const purposeLower = purpose.toLowerCase();
  if (purposeLower.includes("data")) {
    Icon = Globe;
    iconBg = "bg-blue-50";
    iconColor = "text-blue-600";
  } else if (purposeLower.includes("airtime") || purposeLower.includes("pin")) {
    Icon = Smartphone;
    iconBg = "bg-red-50";
    iconColor = "text-red-500";
  } else if (purposeLower.includes("electricity")) {
    Icon = Zap;
    iconBg = "bg-amber-50";
    iconColor = "text-amber-500";
  } else if (purposeLower.includes("tv") || purposeLower.includes("cable")) {
    Icon = Tv;
    iconBg = "bg-indigo-50";
    iconColor = "text-indigo-600";
  }

  return (
    <Link to={`/dashboard/history/${transaction.reference}`} className="flex items-center justify-between hover:bg-slate-50 transition-colors group py-3 px-2 rounded-xl">
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
          <div className={`size-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
              <Icon className={`size-5 ${iconColor}`} />
          </div>
          <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-semibold truncate text-slate-800 tracking-tight group-hover:text-blue-600">
                {purpose === "wallet_to_wallet_transfer" && <span>{txnDirection === "CREDIT" ? "from " : txnDirection === "DEBIT" ? "to " : ""}</span>}
                <span className="capitalize">{service}</span>
              </h3>
              <p className="text-[10px] md:text-xs text-slate-500 tracking-wide flex items-center gap-1 mt-0.5 font-medium min-w-0">
                  <span className="truncate capitalize">{purpose.replaceAll("_", " ")}</span>
                  <span className="shrink-0">•</span>
                  <span className={`${statusColor} uppercase tracking-wider text-[9px] md:text-[10px] font-bold shrink-0`}>
                    {status}
                  </span>
              </p>
          </div>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-2">
          <p className={`text-sm md:text-[15px] font-semibold font-mono tabular-nums whitespace-nowrap ${amountColor}`}>
            {isCredit ? "+" : ""}
            {formatAmount(transaction?.amount as number)}
          </p>
          {transaction?.createdAt && (
            <span className="text-[#667085] text-xs">
                 {new Date(transaction.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          )}
      </div>
    </Link>
  )
}

export default TransactionHistoryCard;