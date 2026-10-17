import { FormEvent, useState, useCallback } from "react";
import { formatAmount } from "@/lib/utils";
import CustomButton from "@/components/CustomButton";
import BackButton from "@/components/Authentication/BackButton";
import EnterPin from "@/components/dashboard/EnterPin";
import useIsMobile from "@/hooks/useIsMobile";
import useSmmStore from "@/stores/useSmmStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { placeSmmOrder } from "@/lib/api/dashboard-apis/servicesApis";
import { getWallet } from "@/lib/api/dashboard-apis/walletApis";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { AlertCircle, Wallet } from "lucide-react";

const ConfirmSmmPayment = () => {
  const [paymentPin, setPaymentPin] = useState<string>("");
  const [showPinForm, setShowPinForm] = useState(false);

  const isMobile = useIsMobile();
  const {
    step,
    platformName,
    productName,
    productId,
    link,
    quantity,
    amount,
    update,
  } = useSmmStore();

  const { data: wallet } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: getWallet,
  });

  const walletBalance = Number(wallet?.balance) || 0;
  const isBalanceInsufficient = walletBalance < amount;

  const { mutate, isPending } = useMutation({
    mutationFn: placeSmmOrder,
    onSuccess: (data: any) => {
      setPaymentPin("");
      setShowPinForm(false);
      update({ step: step + 1, txnResult: data });
    },
    onError: (error: AxiosError) => {
      setPaymentPin("");
      setShowPinForm(false);
      const errData = error.response?.data as { message?: string };
      const failureMessage =
        errData?.message || "Something went wrong placing your SMM order.";
      update({
        step: step + 1,
        txnResult: null,
        errorMessage: failureMessage,
      });
      toast.error(failureMessage);
    },
  });

  const handleSubmit = useCallback((e?: FormEvent) => {
    if (e) e.preventDefault();
    if (isPending) return;
    mutate({
      productId,
      link,
      quantity: Number(quantity) || 0,
      pin: paymentPin,
    });
  }, [isPending, mutate, productId, link, quantity, paymentPin]);

  return (
    <div className="min-h-full flex md:items-center justify-center relative">
      <section className="w-full max-w-[420px] mx-auto flex flex-col max-md:justify-center">
        <BackButton
          disabled={isPending}
          icon={isMobile}
          action={() => update({ step: step - 1 })}
          className="mb-6"
        />

        <div className="bg-white border border-[#F0F2F5] rounded-2xl p-6 shadow-sm">
          <h1 className="text-[var(--aqua)] font-medium text-2xl text-center">
            Confirm SMM Order
          </h1>
          <p className="text-[#717171] text-sm text-center mt-1">
            Review your order details before completing payment
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <span className="text-xs text-[#667085] uppercase tracking-wider font-medium">
              Total Charge
            </span>
            <span className="text-2xl font-bold text-[#101828] mt-1">
              {formatAmount(amount)}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#475467]">
              <Wallet className="size-3.5 text-[var(--aqua)]" />
              <span>
                Wallet Balance:{" "}
                <strong
                  className={
                    isBalanceInsufficient ? "text-red-500" : "text-emerald-600"
                  }
                >
                  {formatAmount(walletBalance)}
                </strong>
              </span>
            </div>
          </div>

          {isBalanceInsufficient && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Insufficient Balance</p>
                <p className="mt-0.5 text-red-600">
                  Please top up your wallet before proceeding with this order.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-[#667085]">Platform</span>
              <span className="font-medium text-[#101828] capitalize">
                {platformName || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-[#667085]">Service</span>
              <span
                className="font-medium text-[#101828] text-right max-w-[220px] truncate"
                title={productName}
              >
                {productName || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-[#667085]">Quantity</span>
              <span className="font-medium text-[#101828]">
                {quantity.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col py-2 border-b border-slate-100 gap-1">
              <span className="text-[#667085]">Target Link</span>
              <span
                className="font-medium text-[#101828] text-xs break-all bg-slate-50 p-2 rounded-md font-mono"
                title={link}
              >
                {link || "-"}
              </span>
            </div>
          </div>

          <CustomButton
            disabled={isPending || isBalanceInsufficient}
            onClick={() => setShowPinForm(true)}
            className="w-full mt-6 h-12 text-base"
          >
            Proceed - <span className="opacity-75">Enter PIN</span>
          </CustomButton>
        </div>
      </section>

      <EnterPin
        isOpen={showPinForm}
        onClose={() => {
          setPaymentPin("");
          setShowPinForm(false);
        }}
        disable={isPending}
        handleSubmit={handleSubmit}
        value={paymentPin}
        onValueChange={setPaymentPin}
      />
    </div>
  );
};

export default ConfirmSmmPayment;
