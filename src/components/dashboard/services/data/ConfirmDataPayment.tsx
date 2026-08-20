import { FormEvent, useState } from "react"
import { formatAmount } from "@/lib/utils";
import CustomButton from "@/components/CustomButton"
import BackButton from "@/components/Authentication/BackButton"
import EnterPin from "@/components/dashboard/EnterPin";
import useIsMobile from "@/hooks/useIsMobile";
import useServiceFlowStore from "@/stores/useServiceFlowStore";
import { useMutation } from "@tanstack/react-query";
import { buyData } from "@/lib/api/dashboard-apis/servicesApis";
import { AxiosError } from "axios";
import { toast } from "sonner";

const ConfirmDataPayment = () => {
    const [paymenTPin, SetPaymenTPin] = useState<string>("");
    const [showPinForm, setShowPinForm] = useState(false);
  
    const isMobile = useIsMobile();
    const {update, step, phone, type, plan, dataPlans, useCashback, cashbackRule, amount} = useServiceFlowStore();

    const selectedPlan = dataPlans?.find((dataPlan: any) => 
        (dataPlan.id || dataPlan._id || "").toString() === (plan || "").toString()
    );
    const planName = selectedPlan?.name || "Data Plan";
    const planAmount = selectedPlan?.amount !== undefined ? Number(selectedPlan.amount) : (amount ? Number(amount) : 0);

    const {mutate, isPending} = useMutation({
        mutationFn: buyData,
        onSuccess: (data) => {
          update({step: step+1, txnResult: data});
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
        mutate({phone, pin: paymenTPin, type, productId:plan, useCashback })
    }
  
    return (
      <div className="min-h-full flex md:items-center justify-center relative">
        <section className="w-full max-w-[358px] mx-auto flex flex-col max-md:justify-center max-md:text-center">
            <BackButton disabled={isPending} icon={isMobile} action={() => update({step: step-1})} className="mb-8" />
            <h1 className="text-[var(--aqua)] font-medium text-2xl">Confirm purchase</h1>
            <p className="text-[#717171] md:mt-2">Confirm the details of this purchase</p>

            <p className="text-[#101828] md:text-xl mt-5 md:mt-8 mb-4">You are about to purchase <span className="font-medium">{planName}</span> for <span className="font-medium">{formatAmount(planAmount as number)}</span> on <span className="font-medium">{phone}</span>.</p>
            
            {cashbackRule && (
              <div className="flex items-center justify-between bg-green-50/50 p-3 rounded-lg border border-green-100 mb-6">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-green-800">Apply Cashback Balance</span>
                  <span className="text-xs text-green-600/80">Use your earned cashback to discount this purchase</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={useCashback} onChange={(e) => update({ useCashback: e.target.checked })} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--aqua)]"></div>
                </label>
              </div>
            )}

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
  
  export default ConfirmDataPayment;
