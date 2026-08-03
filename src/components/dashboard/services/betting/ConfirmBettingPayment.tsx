import { FormEvent, useState } from "react"
import { formatAmount } from "@/lib/utils";
import CustomButton from "@/components/CustomButton"
import BackButton from "@/components/Authentication/BackButton"
import EnterPin from "@/components/dashboard/EnterPin";
import useIsMobile from "@/hooks/useIsMobile";
import useBettingStore from "@/stores/useBettingStore";
import { useMutation } from "@tanstack/react-query";
import { fundBettingWallet } from "@/lib/api/dashboard-apis/servicesApis";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { TBettingTransaction } from "@/stores/useBettingStore";

const ConfirmBettingPayment = () => {
  const [paymenTPin, SetPaymenTPin] = useState<string>("");
  const [showPinForm, setShowPinForm] = useState(false);

  const isMobile = useIsMobile();
  const { update, step, amount, user, provider } = useBettingStore();

  const {mutate, isPending} = useMutation({
      mutationFn: fundBettingWallet,
      onSuccess: (data) => {
        update({step: step+1, txnResult: data as TBettingTransaction});
      },
      onError: (error: AxiosError) => {
        console.log({error})
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
      mutate({providerId: provider as string, amount: String(amount), pin: paymenTPin, number: user as string})
  }

  return (
    <div className="min-h-full flex md:items-center justify-center relative">
        <section className="w-full max-w-[358px] mx-auto flex flex-col max-md:justify-center max-md:text-center">
            <BackButton disabled={isPending} icon={isMobile} action={() => update({step: step-1})} className="mb-8" />
            <h1 className="text-[var(--aqua)] font-medium text-2xl">Confirm purchase</h1>
            <p className="text-[#717171] md:mt-2">Confirm the details of this purchase</p>

            <p className="text-[#101828] md:text-xl my-5 md:my-8">You are about to pay <span className="font-medium">{formatAmount(parseInt(amount))}</span> for Betting funding on <span className="font-medium">{user}</span>.</p>
            <CustomButton disabled={isPending} onClick={() => setShowPinForm(true)} className="w-full mx-auto">Proceed - <span className="opacity-60">Confirm Purchase</span></CustomButton>
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

export default ConfirmBettingPayment;