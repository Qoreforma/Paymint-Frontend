import { FormEvent, useState } from "react";
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
      setShowPinForm(false);
      update({ step: step + 1, txnResult: data });
    },
    onError: (error: AxiosError) => {
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

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    mutate({
      productId,
      link,
      quantity: Number(quantity),
      pin: paymentPin,
    });
  };

  return (
    <div className="min-h-full flex md:items-center justify-center relative">
      <section className="w-full max-w-[420px] mx-auto flex flex-col">
        <BackButton
          disabled={isPending}
          icon={isMobile}
          action={() => update({ step: step - 1 })}
          className="mb-6"
        />

        <div className="mb-6">
          <h1 className="text-[var(--aqua)] font-display font-semibold text-2xl">
            Confirm SMM Order
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review the details of your social media order before completing the payment.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3.5 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Platform</span>
            <span className="font-semibold text-slate-800">{platformName}</span>
          </div>
          <div className="flex justify-between items-start text-sm border-t border-slate-100 pt-3">
            <span className="text-slate-500">Service</span>
            <span className="font-semibold text-slate-800 text-right max-w-[220px] line-clamp-2">
              {productName}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
            <span className="text-slate-500">Target Link</span>
            <span className="font-semibold text-blue-600 truncate max-w-[200px]" title={link}>
              {link}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
            <span className="text-slate-500">Quantity</span>
            <span className="font-semibold text-slate-800">{Number(quantity).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-3 font-semibold">
            <span className="text-slate-700">Total Amount</span>
            <span className="text-blue-600 text-base">{formatAmount(amount)}</span>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/80 mb-6">
          <div className="flex items-center gap-2.5">
            <Wallet className="size-4 text-blue-600" />
            <span className="text-xs font-medium text-slate-600">Available Wallet Balance</span>
          </div>
          <span className="text-xs font-bold text-slate-800 font-mono">
            {formatAmount(walletBalance)}
          </span>
        </div>

        {isBalanceInsufficient && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs mb-6">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              Your wallet balance is insufficient for this transaction. Please fund your wallet to proceed.
            </span>
          </div>
        )}

        <CustomButton
          disabled={isPending || isBalanceInsufficient}
          onClick={() => setShowPinForm(true)}
          className="w-full"
        >
          Confirm and Pay {formatAmount(amount)}
        </CustomButton>
      </section>

      <EnterPin
        isOpen={showPinForm}
        onClose={() => setShowPinForm(false)}
        disable={isPending}
        handleSubmit={handleSubmit}
        value={paymentPin}
        onValueChange={setPaymentPin}
      />
    </div>
  );
};

export default ConfirmSmmPayment;
