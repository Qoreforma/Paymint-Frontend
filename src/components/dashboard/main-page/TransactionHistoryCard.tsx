import { Transaction } from "@/lib/api/dashboard-apis/txnHistoryApis";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowUpRight,
  Wallet,
  Globe,
  Zap,
  Tv,
  Landmark,
  Receipt,
  X,
  Clock,
  Smartphone,
} from "lucide-react";

type TTransactionHistoryCard = {
  transaction: Transaction & { direction?: string; metadata?: any };
};

export function getTransactionDisplayInfo(transaction: Transaction & { direction?: string; metadata?: any }) {
  const metadata = transaction?.metadata || {};
  const serviceName = (metadata.serviceName || metadata.productName || "").toLowerCase();
  const network = (metadata.network || "").toLowerCase();
  const purpose = (transaction?.purpose || transaction?.type || "").toLowerCase();
  const direction = transaction?.direction || "DEBIT";
  const isCredit = direction === "CREDIT" || purpose === "refund" || purpose === "deposit" || purpose === "wallet_fund";
  const status = (transaction?.status || "success").toLowerCase();

  // Detect Provider / Network / Brand
  const isMtn = serviceName.includes("mtn") || network.includes("mtn") || purpose.includes("mtn");
  const isAirtel = serviceName.includes("airtel") || network.includes("airtel") || purpose.includes("airtel");
  const isGlo = serviceName.includes("glo") || network.includes("glo") || purpose.includes("glo");
  const is9mobile = serviceName.includes("9mobile") || serviceName.includes("etisalat") || network.includes("9mobile") || purpose.includes("9mobile");

  // Determine Title
  let title = "Transaction";
  if (purpose === "deposit" || purpose === "wallet_fund" || (isCredit && !purpose.includes("transfer") && !purpose.includes("refund"))) {
    title = "Deposit";
  } else if (purpose.includes("airtime") || serviceName.includes("airtime")) {
    if (isMtn) title = "MTN AIRTIME";
    else if (isAirtel) title = "AIRTEL AIRTIME";
    else if (isGlo) title = "GLO AIRTIME";
    else if (is9mobile) title = "9MOBILE AIRTIME";
    else title = metadata.serviceName || "Airtime";
  } else if (purpose.includes("data") || serviceName.includes("data")) {
    if (isMtn) title = "MTN Data";
    else if (isAirtel) title = "Airtel Data";
    else if (isGlo) title = "Glo Data";
    else if (is9mobile) title = "9mobile Data";
    else title = metadata.serviceName || "Data";
  } else if (purpose.includes("electricity") || serviceName.includes("electric")) {
    title = metadata.serviceName || "Electricity";
  } else if (purpose.includes("cable") || purpose.includes("tv") || serviceName.includes("dstv") || serviceName.includes("gotv") || serviceName.includes("startimes")) {
    title = metadata.serviceName || "Cable TV";
  } else if (purpose.includes("betting")) {
    title = metadata.serviceName || "Betting";
  } else if (purpose === "bank_transfer" || purpose.includes("withdraw")) {
    title = metadata.bankName && metadata.accountNumber ? `${metadata.bankName} Transfer` : "Withdrawal";
  } else if (purpose === "wallet_to_wallet_transfer") {
    title = isCredit ? `Transfer from @${metadata.senderUsername || "user"}` : `Transfer to @${metadata.recipientName || "user"}`;
  } else if (metadata.serviceName) {
    title = metadata.serviceName;
  } else {
    title = purpose.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Format Date & Time: "16 Aug, 2026 – 06:05 PM"
  let formattedDateTime = "";
  if (transaction?.createdAt) {
    try {
      const d = new Date(transaction.createdAt);
      const datePart = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      formattedDateTime = `${datePart} – ${timePart}`;
    } catch {
      formattedDateTime = String(transaction.createdAt);
    }
  }

  // Determine Status label & color
  let statusLabel = "Successful";
  let statusColor = "text-[#12B76A]";
  if (status === "success" || status === "successful") {
    statusLabel = "Successful";
    statusColor = "text-[#12B76A]";
  } else if (status === "pending" || status === "processing") {
    statusLabel = "Pending";
    statusColor = "text-[#F79009]";
  } else if (status === "reversed") {
    statusLabel = "Reversed";
    statusColor = "text-[#6366F1]";
  } else {
    statusLabel = "Failed";
    statusColor = "text-[#F04438]";
  }

  // Determine amount with sign
  const rawAmt = Number(transaction?.amount || 0);
  const formattedAmt = `${isCredit ? "+" : "-"}₦${rawAmt.toLocaleString("en-US", {
    minimumFractionDigits: rawAmt % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

  return {
    title,
    formattedDateTime,
    statusLabel,
    statusColor,
    formattedAmt,
    isCredit,
    isMtn,
    isAirtel,
    isGlo,
    is9mobile,
    purpose,
    status,
    serviceName,
  };
}

export function TransactionAvatar({
  info,
}: {
  info: ReturnType<typeof getTransactionDisplayInfo>;
}) {
  const { isMtn, isAirtel, isGlo, is9mobile, isCredit, purpose, status, serviceName } = info;

  // Render Inner Icon / Brand Logo
  let avatarContent = null;
  let bgClass = "bg-[#F0F3F8] text-[#344054]";

  if (isMtn) {
    bgClass = "bg-[#FFCC00] text-black shadow-xs";
    avatarContent = (
      <div className="border border-black/80 rounded-full px-1.5 py-0.5 flex items-center justify-center">
        <span className="font-black text-[11px] tracking-tight leading-none text-black">
          MTN
        </span>
      </div>
    );
  } else if (isAirtel) {
    bgClass = "bg-[#ED1C24] text-white shadow-xs";
    avatarContent = (
      <span className="font-bold text-[11px] tracking-tight lowercase">
        airtel
      </span>
    );
  } else if (isGlo) {
    bgClass = "bg-[#2EB82E] text-white shadow-xs";
    avatarContent = (
      <span className="font-bold text-[12px] tracking-tight lowercase">
        glo
      </span>
    );
  } else if (is9mobile) {
    bgClass = "bg-[#005B38] text-white shadow-xs";
    avatarContent = (
      <span className="font-bold text-[10px] tracking-tight">
        9mobile
      </span>
    );
  } else if (isCredit || purpose === "deposit" || purpose === "wallet_fund") {
    bgClass = "bg-[#F0F3F8] text-[#344054]";
    avatarContent = <Wallet className="size-5 text-[#344054]" strokeWidth={1.8} />;
  } else if (purpose.includes("data") || serviceName.includes("data")) {
    bgClass = "bg-[#F0F3F8] text-[#344054]";
    avatarContent = <Globe className="size-5 text-[#344054]" strokeWidth={1.8} />;
  } else if (purpose.includes("airtime")) {
    bgClass = "bg-[#F0F3F8] text-[#344054]";
    avatarContent = <Smartphone className="size-5 text-[#344054]" strokeWidth={1.8} />;
  } else if (purpose.includes("electricity") || serviceName.includes("electric")) {
    bgClass = "bg-[#F0F3F8] text-[#344054]";
    avatarContent = <Zap className="size-5 text-[#344054]" strokeWidth={1.8} />;
  } else if (purpose.includes("cable") || purpose.includes("tv")) {
    bgClass = "bg-[#F0F3F8] text-[#344054]";
    avatarContent = <Tv className="size-5 text-[#344054]" strokeWidth={1.8} />;
  } else if (purpose.includes("bank") || purpose.includes("withdraw")) {
    bgClass = "bg-[#F0F3F8] text-[#344054]";
    avatarContent = <Landmark className="size-5 text-[#344054]" strokeWidth={1.8} />;
  } else {
    bgClass = "bg-[#F0F3F8] text-[#344054]";
    avatarContent = <Receipt className="size-5 text-[#344054]" strokeWidth={1.8} />;
  }

  // Small Corner Badge
  let badge = null;
  if (status === "pending" || status === "processing") {
    badge = (
      <div className="size-4.5 rounded-full bg-[#F79009] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 border-2 border-white shadow-xs">
        <Clock className="size-2.5 stroke-[2.5]" />
      </div>
    );
  } else if (status === "failed") {
    badge = (
      <div className="size-4.5 rounded-full bg-[#F04438] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 border-2 border-white shadow-xs">
        <X className="size-2.5 stroke-[3]" />
      </div>
    );
  } else if (isCredit) {
    badge = (
      <div className="size-4.5 rounded-full bg-[#12B76A] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 border-2 border-white shadow-xs">
        <Check className="size-2.5 stroke-[3]" />
      </div>
    );
  } else {
    badge = (
      <div className="size-4.5 rounded-full bg-[#F04438] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 border-2 border-white shadow-xs">
        <ArrowUpRight className="size-2.5 stroke-[3]" />
      </div>
    );
  }

  return (
    <div className={`relative size-11 sm:size-12 rounded-full ${bgClass} flex items-center justify-center shrink-0`}>
      {avatarContent}
      {badge}
    </div>
  );
}

const TransactionHistoryCard = ({ transaction }: TTransactionHistoryCard) => {
  const info = getTransactionDisplayInfo(transaction);

  return (
    <Link
      to={`/dashboard/history/${transaction.reference}`}
      className="flex items-center justify-between hover:bg-slate-50/80 transition-colors group py-3 px-2 rounded-2xl"
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
        <TransactionAvatar info={info} />

        <div className="flex flex-col min-w-0">
          <h3 className="text-sm sm:text-[14.5px] font-bold truncate text-[#101828] tracking-tight group-hover:text-blue-600">
            {info.title}
          </h3>
          <p className="text-xs text-[#667085] tracking-tight mt-0.5 font-normal truncate">
            {info.formattedDateTime}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-2">
        <p className="text-sm sm:text-[15px] font-bold font-display text-[#101828] tabular-nums whitespace-nowrap">
          {info.formattedAmt}
        </p>
        <span className={`text-xs font-semibold ${info.statusColor} capitalize mt-0.5`}>
          {info.statusLabel}
        </span>
      </div>
    </Link>
  );
};

export default TransactionHistoryCard;