import { FormEvent, useState, useCallback } from "react"

import CustomButton from "@/components/CustomButton"
import BackButton from "@/components/Authentication/BackButton"
import EnterPin from "@/components/dashboard/EnterPin";
import useIsMobile from "@/hooks/useIsMobile";
import useWithdrawFundsStore from "@/stores/useWithdrawFunds";
import { formatAmount } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { withdrawToBank } from "@/lib/api/dashboard-apis/walletApis";
import { AxiosError } from "axios";
import { toast } from "sonner";

export type TWithdrawToBankPayload = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: string;
  pin: string;
}

export type TWithdrawToBankResponse = {
  reference: string;
  amount: number;
  fee: number;
  total: number;
  recipient: {
      accountNumber: string;
      accountName: string;
      bankName: string;
  };
  provider: {
      name: string;
      reference: string;
      status: string;
      responseCode: string;
  };
  balance: {
      before: number;
      after: number;
  };
  status: string;
  createdAt: string;
}


const ConfirmFundsWithdrawal = () => {
  const [paymenTPin, SetPaymenTPin] = useState<string>("");
  const [showPinForm, setShowPinForm] = useState(false);

  const isMobile = useIsMobile();
  const { update, amount, bank_account, selectedBank, accountName } = useWithdrawFundsStore();

  const {mutate, isPending} = useMutation<TWithdrawToBankResponse, AxiosError, TWithdrawToBankPayload>({
    mutationFn: withdrawToBank,
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
      if (isPending || !selectedBank) return;

      mutate({bankCode: selectedBank.bankCode, accountNumber: bank_account, accountName: accountName, amount, pin: paymenTPin})
  }, [isPending, selectedBank, bank_account, accountName, amount, paymenTPin, mutate]);

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
            <h1 className="text-[var(--aqua)] font-medium text-2xl">Confirm Withdrawal</h1>
            <p className="text-[#717171] md:mt-2">Confirm the details of this withdrawal</p>

            <p className="text-[#101828] md:text-xl my-5 md:my-8">You are about to withdraw <span className="font-medium">{formatAmount(parseInt(amount))}</span> to <span className="font-medium">{bank_account} ({selectedBank?.name})</span>.</p>
            <CustomButton disabled={isPending} onClick={() => setShowPinForm(true)} className="w-full mx-auto">Proceed - <span className="opacity-60">Confirm Withdrawal</span></CustomButton>
          </section>
          }
    </div>
  )
}

export default ConfirmFundsWithdrawal