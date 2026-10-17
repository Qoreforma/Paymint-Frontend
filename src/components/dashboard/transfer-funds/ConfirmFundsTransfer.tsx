import { FormEvent, useState, useCallback } from "react"

import CustomButton from "@/components/CustomButton"
import BackButton from "@/components/Authentication/BackButton"
import EnterPin from "@/components/dashboard/EnterPin";
import useIsMobile from "@/hooks/useIsMobile";
import useTransferFundsStore, { TTransferFundsResponse } from "@/stores/useTransferFundsStore";
import { formatAmount } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { transferFunds } from "@/lib/api/dashboard-apis/walletApis";
import { AxiosError } from "axios";
import { toast } from "sonner";

export type TTransferFundsPayload = {
  beneficiary: string;
  amount: string;
  pin: string;
}

const ConfirmFundsTransfer = () => {
  const [paymenTPin, SetPaymenTPin] = useState<string>("");
  const [showPinForm, setShowPinForm] = useState(false);

  const isMobile = useIsMobile();
  const { update, user, amount } = useTransferFundsStore();

    const {mutate, isPending} = useMutation<TTransferFundsResponse, AxiosError, TTransferFundsPayload>({
      mutationFn: transferFunds,
      onSuccess: (data) => {
        SetPaymenTPin("");
        setShowPinForm(false);
        update({step: 3, txnResult: data});
      },
      onError: (error: AxiosError) => {
        SetPaymenTPin("");
        setShowPinForm(false);
        update({step: 3, txnResult: null});
        const errData = error.response?.data as { message?: string };
        if(errData?.message){
            return toast.error(errData.message)
        }
        toast.error("Something went wrong, please try again")
      }
    })

    const handleSubmit = useCallback((e?: FormEvent) => {
        if (e) e.preventDefault();
        if (isPending) return;
        mutate({beneficiary: user, amount, pin: paymenTPin})
    }, [isPending, mutate, user, amount, paymenTPin]);

  return (
    <div className="min-h-full flex md:items-center justify-center">
      {
        showPinForm ? 
          <section className="flex flex-col max-md:justify-center max-md:text-center">
                <BackButton disabled={isPending} icon={isMobile} action={() => {
                  SetPaymenTPin("");
                  setShowPinForm(false);
                }} className="mb-8" />

                <h1 className="text-[var(--aqua)] font-medium text-2xl">Confirm Payment</h1>
                <p className="text-[#717171] mt-2 text-sm md:text-base mb-6">Enter your transaction pin to confirm this purchase</p>

                <EnterPin inline disable={isPending} handleSubmit={handleSubmit} value={paymenTPin} onValueChange={SetPaymenTPin} />
          </section> :
          <section className="w-full max-w-[358px] mx-auto flex flex-col max-md:justify-center max-md:text-center">
            <BackButton disabled={isPending} icon={isMobile} action={() => update({step: 1})} className="mb-8" />
            <h1 className="text-[var(--aqua)] font-medium text-2xl">Confirm Transfer</h1>
            <p className="text-[#717171] md:mt-2">Confirm the details of this fund transfer</p>

            <p className="text-[#101828] md:text-xl my-5 md:my-8">You are about to transfer <span className="font-medium">{formatAmount(parseInt(amount))}</span> to <span className="font-medium">{user}</span>.</p>
            <CustomButton disabled={isPending} onClick={() => setShowPinForm(true)} className="w-full mx-auto">Proceed - <span className="opacity-60">Confirm Purchase</span></CustomButton>
          </section>
      }
    </div>
  )
}

export default ConfirmFundsTransfer;