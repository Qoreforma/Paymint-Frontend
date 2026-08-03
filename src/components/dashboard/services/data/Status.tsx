import { LuFolder, LuRefreshCcw } from "react-icons/lu";

import CustomButton from "@/components/CustomButton";
import { formatAmount } from "@/lib/utils";
import useServiceFlowStore from "@/stores/useServiceFlowStore";
import { useTransactionSocket } from "@/hooks/useTransactionSocket";

import SuccessIcon from "@/assets/dashboard/success_icon.svg";
import FailedIcon from "@/assets/dashboard/fail_icon.svg";

const Status = () => {
    const {txnResult, phone, plan, dataPlans, reset} = useServiceFlowStore();

    const planAmount = dataPlans.find((dataPlan) => dataPlan.id === plan)?.amount
    const planName = dataPlans.find((dataPlan) => dataPlan.id === plan)?.name

    // Wire in websocket for real-time updates
    const { status: socketStatus } = useTransactionSocket(txnResult?.result?.reference || null);

    // Determine the current effective status.
    const currentStatus = socketStatus || txnResult?.result?.status || "failed";
    const isSuccess = currentStatus === "success";
    const isPending = currentStatus === "processing" || currentStatus === "pending";

  return (
    <div className="grid place-items-center min-h-full w-full">
        <section className="w-full max-w-[325px] flex flex-col items-center">
            {isPending ? (
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--aqua)]"></div>
                    <p className="mt-4 text-[var(--aqua)] font-medium text-lg">Processing your transaction...</p>
                </div>
            ) : (
                <>
                    <img className="h-[113px] w-[124px] md:w-[175px] md:h-[160px] object-cover" src={isSuccess ? SuccessIcon : FailedIcon} />
                    <h1 className="font-medium text-2xl text-[var(--aqua)] mt-2">Transaction {isSuccess ? "successful" : "failed"}</h1>
                    <p className="md:text-xl md:font-medium text-center mt-3 mb-12 md:my-10 max-md:text-[#717171]">
                        <span className="font-medium">Your Data purchase of {planName} for {formatAmount(parseInt(planAmount?.toString() as string))} on <span className="font-medium">{phone}</span> {isSuccess ? "is successful" : "failed"}. </span>
                    </p>
                    <div className="flex flex-col items-center w-full gap-2">
                        <CustomButton className="w-full text-center" href="/dashboard">Return to dashboard</CustomButton>
                        {
                            isSuccess ? (
                                <div className="flex flex-col gap-2 w-full mt-2">
                                    <CustomButton href={`/receipt?txnId=${txnResult?.result?.reference}`} variant="primary" className="flex items-center justify-center gap-3 w-full md:border border-[var(--aqua)] font-medium text-[var(--aqua)] bg-transparent">
                                        <LuFolder className="size-6" />
                                        <span>Transaction details</span>
                                    </CustomButton>
                                    <CustomButton onClick={() => reset()} variant="primary" className="flex items-center justify-center gap-3 w-full md:border border-[var(--aqua)] font-medium text-[var(--aqua)] bg-transparent">
                                        <LuRefreshCcw className="size-6" />
                                        <span>Repeat transaction</span>
                                    </CustomButton>
                                </div>
                            ) : (
                                <CustomButton onClick={() => reset()} variant="primary" className="flex items-center justify-center gap-3 w-full md:border border-[var(--aqua)] font-medium text-[var(--aqua)] bg-transparent mt-2">
                                    <LuRefreshCcw className="size-6" />
                                    <span>Try again</span>
                                </CustomButton>
                            )
                        }
                    </div>
                </>
            )}
        </section>
    </div>
  )
}

export default Status;
