import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  RotateCcw, 
  Copy, 
  Check, 
  FileText, 
  RefreshCw, 
  HelpCircle, 
  ShieldCheck
} from "lucide-react";
import { copyToClipboard, formatAmount } from "@/lib/utils";
import { toast } from "sonner";

export type TransactionStatusType = "success" | "failed" | "pending" | "processing" | "reversed" | string;

export interface TransactionDetailItem {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
  isCopyable?: boolean;
}

export interface TransactionStatusProps {
  status: TransactionStatusType;
  title?: string;
  subtitle?: string;
  amount: number | string;
  transactionType: string;
  reference?: string;
  date?: string | Date;
  details?: TransactionDetailItem[];
  fee?: string | number;
  receiptUrl?: string;
  onReset?: () => void;
  onRetry?: () => void;
  dashboardUrl?: string;
  supportUrl?: string;
  helpMessage?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status = "failed",
  title,
  subtitle,
  amount,
  transactionType,
  reference,
  date,
  details = [],
  fee = "Free",
  receiptUrl,
  onReset,
  onRetry,
  dashboardUrl = "/dashboard",
  supportUrl = "/dashboard/settings/support",
  helpMessage,
}) => {
  const navigate = useNavigate();
  const [copiedRef, setCopiedRef] = useState(false);

  const normalizedStatus = (status || "").toLowerCase();
  const isSuccess = normalizedStatus === "success";
  const isPending = normalizedStatus === "pending" || normalizedStatus === "processing";
  const isReversed = normalizedStatus === "reversed";

  const handleCopyRef = async () => {
    if (!reference) return;
    await copyToClipboard(reference, "Transaction reference copied!");
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Status visual config
  const getStatusConfig = () => {
    if (isSuccess) {
      return {
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/25",
        icon: <CheckCircle2 className="size-10 stroke-[2.5]" />,
        title: title || "Transaction Successful",
        subtitle: subtitle || "Your transaction has been processed and completed successfully.",
        pillLabel: "Success",
        pillStyle: "bg-emerald-100/80 text-emerald-800 border-emerald-300/60",
        explanation: helpMessage || "The recipient has been credited and funds have left your account.",
      };
    }
    if (isPending) {
      return {
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
        iconBg: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25",
        icon: <Clock className="size-10 stroke-[2.5]" />,
        title: title || "Transaction Processing",
        subtitle: subtitle || "Your transaction is currently being processed by the system.",
        pillLabel: "Processing",
        pillStyle: "bg-amber-100/80 text-amber-800 border-amber-300/60",
        explanation: helpMessage || "Bank confirmation usually takes 1–5 minutes. You can safely return to the dashboard.",
      };
    }
    if (isReversed) {
      return {
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
        iconBg: "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/25",
        icon: <RotateCcw className="size-10 stroke-[2.5]" />,
        title: title || "Transaction Reversed",
        subtitle: subtitle || "This transaction could not be completed and has been reversed.",
        pillLabel: "Reversed",
        pillStyle: "bg-indigo-100/80 text-indigo-800 border-indigo-300/60",
        explanation: helpMessage || "Funds have been returned to your wallet balance.",
      };
    }
    // Failed
    return {
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25",
      icon: <XCircle className="size-10 stroke-[2.5]" />,
      title: title || "Transaction Failed",
      subtitle: subtitle || "We couldn't process this transaction. No funds were debited.",
      pillLabel: "Failed",
      pillStyle: "bg-rose-100/80 text-rose-800 border-rose-300/60",
      explanation: helpMessage || "If your account was debited, it will be automatically refunded within 24 hours.",
    };
  };

  const config = getStatusConfig();
  const numericAmount = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const formattedDate = date 
    ? new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
    : new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="w-full max-w-[540px] mx-auto py-4 px-2">
      {/* Animated Status Header Icon */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className={`size-20 rounded-3xl ${config.iconBg} flex items-center justify-center transition-transform transform hover:scale-105 duration-300`}>
            {config.icon}
          </div>
          {isPending && (
            <div className="absolute -bottom-1 -right-1 size-7 bg-white rounded-full p-1 shadow-md border border-slate-100 flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-amber-600" />
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
          {config.title}
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-1 max-w-md">
          {config.subtitle}
        </p>

        {/* Hero Amount Display */}
        <div className="my-6 flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-extrabold font-display text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>₦</span>
            <span>{numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs">
            <span className={`size-2 rounded-full ${isSuccess ? 'bg-emerald-500' : isPending ? 'bg-amber-500 animate-ping' : isReversed ? 'bg-indigo-500' : 'bg-rose-500'}`} />
            <span className={config.pillStyle.split(' ')[1]}>{config.pillLabel}</span>
          </div>
        </div>

        {/* Status Context Explanation Banner */}
        <div className={`w-full ${config.badgeBg} border rounded-2xl p-4 text-xs md:text-sm text-center mb-6 flex items-center justify-center gap-2 shadow-2xs`}>
          <ShieldCheck className="size-4 shrink-0" />
          <span>{config.explanation}</span>
        </div>
      </div>

      {/* Transaction Details Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-sm space-y-4 mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaction Details</span>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{transactionType}</span>
        </div>

        {/* Custom Detail Items */}
        {details.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm py-1">
            <div className="flex items-center gap-2 text-slate-500">
              {item.icon && <span className="text-slate-400">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-right">
              <span>{item.value}</span>
              {item.isCopyable && typeof item.value === "string" && (
                <button
                  type="button"
                  onClick={() => {
                    copyToClipboard(item.value as string);
                    toast.success(`${item.label} copied!`);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                >
                  <Copy className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Reference Row */}
        {reference && (
          <div className="flex items-center justify-between text-sm py-1 border-t border-slate-100 pt-3">
            <span className="text-slate-500">Reference Number</span>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
              <span className="font-mono text-xs font-bold text-slate-700">{reference}</span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                title="Copy reference"
              >
                {copiedRef ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Date Row */}
        <div className="flex items-center justify-between text-sm py-1">
          <span className="text-slate-500">Date & Time</span>
          <span className="font-medium text-slate-700">{formattedDate}</span>
        </div>

        {/* Fee Row */}
        <div className="flex items-center justify-between text-sm py-1">
          <span className="text-slate-500">Service Fee</span>
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            {typeof fee === "number" ? formatAmount(fee) : fee}
          </span>
        </div>
      </div>

      {/* Action Buttons Tailored to Outcome */}
      <div className="flex flex-col gap-3 w-full">
        {/* Primary Action Button */}
        {isSuccess ? (
          <>
            {receiptUrl ? (
              <Link
                to={receiptUrl}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99]"
              >
                <FileText className="size-5" />
                View Receipt & Download
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => navigate(dashboardUrl)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99]"
              >
                Return to Dashboard
              </button>
            )}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 h-12 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-4" />
                Make Another Transaction
              </button>
            )}

            {receiptUrl && (
              <button
                type="button"
                onClick={() => navigate(dashboardUrl)}
                className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1"
              >
                Return to Dashboard &rarr;
              </button>
            )}
          </>
        ) : isPending ? (
          <>
            <button
              type="button"
              onClick={() => navigate(dashboardUrl)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99]"
            >
              Return to Dashboard
            </button>
            <Link
              to="/dashboard/history"
              className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 h-12 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="size-4" />
              Check Status in History
            </Link>
          </>
        ) : (
          /* Failed / Reversed State */
          <>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99]"
              >
                <RefreshCw className="size-5" />
                Try Again
              </button>
            ) : onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99]"
              >
                <RefreshCw className="size-5" />
                Try Again
              </button>
            ) : null}

            <Link
              to={supportUrl}
              className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 h-12 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <HelpCircle className="size-4 text-slate-500" />
              Contact Support
            </Link>

            <button
              type="button"
              onClick={() => navigate(dashboardUrl)}
              className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1"
            >
              Return to Dashboard &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;
