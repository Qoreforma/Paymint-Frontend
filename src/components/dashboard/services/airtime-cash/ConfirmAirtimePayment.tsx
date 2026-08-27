import { FormEvent, useState } from "react"

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
  if (provider && buybackRates && amount) {
      const rate = buybackRates[provider.toUpperCase()] || buybackRates[provider] || 0;
      expectedAmount = (Number(amount) * rate) / 100;
  }

  const {mutate, isPending} = useMutation({
      mutationFn: finalizeAirtimeCash,
      onSuccess: (data) => {
        update({step: step+1, txnResult: data});
      },
      onError: (error: AxiosError) => {
          update({step: step+1, txnResult: null});
          const errData = error.response?.data as { message?: string };
          if(errData.message){
              return toast.error(errData.message)
          }
          toast.error("Something went wrong, please try again")
      }
  })

  const handleSubmit = (e?: FormEvent) => {
      if (e) e.preventDefault();
      mutate({amount, phone, network: provider, pin: paymenTPin, sharePin })
  }

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

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 my-6 text-left">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-500 text-sm">Airtime Value</span>
                    <span className="font-semibold text-slate-800">{formatAmount(Number(amount))}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-500 text-sm">Phone Number</span>
                    <span className="font-semibold text-slate-800">{phone}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-slate-500 text-sm">Cash Expected</span>
                    <span className="font-semibold text-green-600">{formatAmount(expectedAmount)}</span>
                </div>
            </div>
            
            <div className="text-left w-full mb-6">
                <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="sharePin">Transfer/Share PIN</label>
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

            <CustomButton disabled={isPending} onClick={onProceed} className="w-full mx-auto">Proceed - <span className="opacity-60">Confirm Conversion</span></CustomButton>
        </section>

        <EnterPin 
            isOpen={showPinForm} 
            onClose={() => setShowPinForm(false)} 
            disable={isPending} 
            handleSubmit={handleSubmit} 
            value={paymenTPin} 
            onValueChange={SetPaymenTPin} 
        />
    </div>
  )
}

export default ConfirmAirtimePayment;