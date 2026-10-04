import { LuFolder, LuRefreshCcw } from "react-icons/lu";
import CustomButton from "@/components/CustomButton";
import { formatAmount } from "@/lib/utils";
import useSmmStore from "@/stores/useSmmStore";
import { useTransactionSocket } from "@/hooks/useTransactionSocket";

import SuccessIcon from "@/assets/dashboard/success_icon.svg";
import FailedIcon from "@/assets/dashboard/fail_icon.svg";

const Status = () => {
  const {
    txnResult,
    platformName,
    productName,
    quantity,
    amount,
    reset,
    errorMessage,
  } = useSmmStore();

  const reference = txnResult?.transaction?.reference || "";

  // Wire in websocket for real-time status updates
  const { status: socketStatus } = useTransactionSocket(reference || null);

  const rawStatus = socketStatus || txnResult?.status || (txnResult ? "pending" : "failed");
  const isSuccess = rawStatus === "success";
  const isPending = rawStatus === "pending" || rawStatus === "processing" || rawStatus === "pending_manual";
  const failureReason = errorMessage || (txnResult as any)?.message;

  return (
    <div className="grid place-items-center min-h-full w-full py-4">
      <section className="w-full max-w-[360px] flex flex-col items-center text-center">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <h1 className="font-semibold text-xl text-slate-800">
              Processing your SMM order...
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Your order for {productName} ({Number(quantity).toLocaleString()} units) is being placed with the provider.
            </p>
            {reference && (
              <p className="text-xs font-mono text-slate-400 mt-3 bg-slate-100 px-3 py-1 rounded-full">
                Ref: {reference}
              </p>
            )}
          </div>
        ) : (
          <>
            <img
              className="h-[120px] w-[120px] md:w-[150px] md:h-[150px] object-contain mb-2"
              src={isSuccess ? SuccessIcon : FailedIcon}
              alt={isSuccess ? "Success" : "Failed"}
            />
            <h1 className="font-display font-semibold text-2xl text-slate-900 mt-2">
              Order {isSuccess ? "Successful" : "Failed"}
            </h1>
            <p className="text-slate-600 text-sm mt-2 mb-6">
              {isSuccess ? (
                <span>
                  Your SMM order for{" "}
                  <span className="font-semibold text-slate-800">{productName}</span>{" "}
                  ({Number(quantity).toLocaleString()} units) for{" "}
                  <span className="font-semibold text-slate-800">{formatAmount(amount)}</span> has been placed successfully.
                </span>
              ) : (
                <span>
                  We could not complete your SMM order on {platformName}. Please check your balance or try again.
                </span>
              )}
            </p>

            {!isSuccess && failureReason && (
              <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center">
                <p className="font-medium">{failureReason}</p>
              </div>
            )}

            {reference && (
              <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex justify-between items-center mb-6">
                <span className="text-slate-500">Order Reference</span>
                <span className="font-mono font-medium text-slate-700">{reference}</span>
              </div>
            )}

            <div className="flex flex-col items-center w-full gap-2.5">
              <CustomButton className="w-full text-center" href="/dashboard">
                Return to Dashboard
              </CustomButton>

              {isSuccess ? (
                <div className="flex flex-col gap-2 w-full mt-1">
                  <CustomButton
                    href={`/receipt?txnId=${reference}`}
                    variant="primary"
                    className="flex items-center justify-center gap-2 w-full border border-blue-600 font-medium text-blue-600 bg-transparent hover:bg-blue-50"
                  >
                    <LuFolder className="size-4" />
                    <span>Transaction Details</span>
                  </CustomButton>
                  <CustomButton
                    onClick={() => reset()}
                    variant="primary"
                    className="flex items-center justify-center gap-2 w-full border border-slate-300 font-medium text-slate-700 bg-transparent hover:bg-slate-50"
                  >
                    <LuRefreshCcw className="size-4" />
                    <span>Place Another Order</span>
                  </CustomButton>
                </div>
              ) : (
                <CustomButton
                  onClick={() => reset()}
                  variant="primary"
                  className="flex items-center justify-center gap-2 w-full border border-blue-600 font-medium text-blue-600 bg-transparent hover:bg-blue-50 mt-1"
                >
                  <LuRefreshCcw className="size-4" />
                  <span>Try Again</span>
                </CustomButton>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Status;
