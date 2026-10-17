import { FormEvent, useState, useCallback } from "react"

import CustomButton from "@/components/CustomButton"

import EnterPin from "@/components/dashboard/EnterPin";
import useServiceFlowStore from "@/stores/useServiceFlowStore";
import { formatAmount } from "@/lib/utils";

import { useMutation, useQuery } from "@tanstack/react-query";
import { finalizeAirtimeCash, getAirtimeCashBuybackRates } from "@/lib/api/dashboard-apis/servicesApis";
import { AxiosError } from "axios";
import { toast } from "sonner";

const ConfirmAirtimePayment = () => {
  const [paymenTPin, SetPaymenTPin] = useState<string>("");
  const [sharePin, setSharePin] = useState<string>("");
  const [showPinForm, setShowPinForm] = useState(false);


  const {update, step, phone, amount, provider} = useServiceFlowStore();

  const {
      data: buybackRatesResponse,
  } = useQuery({
      queryKey: ["airtime-cash-rates"] as [string, string?],
      queryFn: getAirtimeCashBuybackRates,
  })

  const buybackRates = buybackRatesResponse?.rates;

  let expectedAmount = 0;
  if (provider && buybackRates && Array.isArray(buybackRates) && amount) {
      const rateObj = buybackRates.find((r: any) => r.network?.toUpperCase() === provider.toUpperCase());
      const rate = rateObj?.buyback_pct || 0;
      expectedAmount = (Number(amount) * rate) / 100;
  }

  const {mutate, isPending} = useMutation({
      mutationFn: finalizeAirtimeCash,
      onSuccess: (data) => {
        SetPaymenTPin("");
        setShowPinForm(false);
        update({step: step+1, txnResult: data});
      },
      onError: (error: AxiosError) => {
          SetPaymenTPin("");
          setShowPinForm(false);
          const errData = error.response?.data as { message?: string };
          const errMsg = errData?.message || "";
          
          if (errMsg.toLowerCase().includes("session") || error.response?.status === 400) {
              toast.error(errMsg || "Airtime cash session expired. Please restart.");
              return update({ step: 1, txnResult: null });
          }

          update({step: step+1, txnResult: null});
          if(errData?.message){
              return toast.error(errData.message)
          }
          toast.error("Something went wrong, please try again")
      }
  })

  const handleSubmit = useCallback((e?: FormEvent) => {
      if (e) e.preventDefault();
      if (isPending) return;
      mutate({amount, phone, network: provider, pin: paymenTPin, sharePin })
  }, [isPending, mutate, amount, phone, provider, paymenTPin, sharePin]);

  const onProceed = () => {
      if (!sharePin) {
          toast.error("Please enter the Share PIN / Transfer PIN");
          return;
      }
      setShowPinForm(true);
  }

  return (
    <div className="min-h-full flex md:items-center justify-center relative">
        <section className="w-full max-w-[358px] mx-auto flex flex-col max-md:justify-center max-md:text-center">
            <h1 className="text-[var(--aqua)] font-medium text-2xl">Confirm Conversion</h1>
            <p className="text-[#717171] md:mt-2">Confirm the details of this conversion</p>

            <div className="bg-[#F8F9FA] p-4 rounded-xl mt-5 md:mt-6 text-left border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Network:</span>
                    <span className="font-semibold text-slate-800 uppercase">{provider}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Phone Number:</span>
                    <span className="font-semibold text-slate-800">{phone}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Airtime Sent:</span>
                    <span className="font-semibold text-slate-800">{formatAmount(parseInt(amount || "0"))}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Cash Received:</span>
                    <span className="font-bold text-base text-[var(--aqua)]">{formatAmount(expectedAmount)}</span>
                </div>
            </div>

            {/* Share PIN Input Field */}
            <div className="mt-5 text-left">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block" htmlFor="sharePin">
                    Airtime Share PIN
                </label>
                <input 
                    value={sharePin}
                    onChange={(e) => setSharePin(e.target.value)}
                    placeholder="Enter Network Transfer PIN"
                    className="w-full border border-slate-200 rounded-xl py-3 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-base font-semibold text-slate-800 transition-all shadow-sm"
                    type="text"
                    id="sharePin"
                />
                <p className="text-xs text-slate-500 mt-1">The PIN you use to transfer airtime on your network.</p>
            </div>

            <CustomButton disabled={isPending} onClick={onProceed} className="w-full mx-auto mt-6">Proceed - <span className="opacity-60">Confirm Conversion</span></CustomButton>
        </section>

        <EnterPin 
            isOpen={showPinForm} 
            onClose={() => {
                SetPaymenTPin("");
                setShowPinForm(false);
            }} 
            disable={isPending} 
            handleSubmit={handleSubmit} 
            value={paymenTPin} 
            onValueChange={SetPaymenTPin} 
        />
    </div>
  )
}

export default ConfirmAirtimePayment;