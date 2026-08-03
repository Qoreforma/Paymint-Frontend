import { useState } from "react";
import BackButton from "@/components/Authentication/BackButton";
import CustomButton from "@/components/CustomButton";
import { Loader2 } from "lucide-react";
import useDataPrintStore from "@/stores/useDataPrintStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buyDataEpin } from "@/lib/api/dashboard-apis/servicesApis";
import { toast } from "sonner";
import { AxiosError } from "axios";
import EnterPin from "@/components/dashboard/EnterPin";

const Checkout = () => {
    const { selectedProvider, selectedProduct, quantity, update, step } = useDataPrintStore();
    const [pin, setPin] = useState("");
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: buyDataEpin,
        onSuccess: (data) => {
            update({ txnResult: data, step: step + 1 });
            queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        },
        onError: (err: AxiosError<{message: string}>) => {
            toast.error(err.response?.data?.message || "Purchase failed. Please try again.");
        }
    });

    const handlePurchase = () => {
        if (!pin || pin.length < 4) {
            toast.error("Please enter a valid PIN");
            return;
        }
        mutate({
            productId: selectedProduct?.id as string,
            quantity,
            pin
        });
    };

    return (
        <section className="w-full max-w-[360px] mx-auto pb-5">
            <div className="flex items-center mb-10 mt-2 md:hidden fixed top-2 w-full max-w-[360px] mx-auto right-0 left-0 z-10 backdrop-blur-[2px] px-5">
                <BackButton icon action={() => update({ step: step - 1 })} disabled={isPending} />
                <p className="text-[#667085] font-medium text-xl w-full text-center mr-6">Confirm Purchase</p>
            </div>

            <div className="max-md:hidden">
                <BackButton className="mb-8" action={() => update({ step: step - 1 })} disabled={isPending} />
                <h1 className="font-medium text-2xl text-[var(--aqua)] ">Confirm Purchase</h1>
                <h2 className=" text-[#717171]">Enter your pin to complete the transaction</h2>
            </div>

            <div className="mt-14 md:mt-8 bg-white border border-[#F0F2F5] rounded-xl p-5 shadow-sm">
                <div className="flex flex-col items-center justify-center mb-6">
                    <p className="text-[#667085] text-sm font-medium">Total Amount</p>
                    <h2 className="text-3xl font-bold text-[#101828] mt-1">₦{((selectedProduct?.amount || 0) * quantity).toLocaleString()}</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#667085]">Network</span>
                        <span className="font-medium text-[#344054] capitalize">{selectedProvider?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm gap-4">
                        <span className="text-[#667085] whitespace-nowrap">Plan</span>
                        <span className="font-medium text-[#344054] text-right line-clamp-1">{selectedProduct?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#667085]">Quantity</span>
                        <span className="font-medium text-[#344054]">{quantity}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <label className="text-sm text-[#344054] font-medium block mb-2 text-center">Enter Transaction PIN</label>
                <div className="flex justify-center">
                    <EnterPin value={pin} onValueChange={(v) => setPin(v)} disable={isPending} handleSubmit={handlePurchase} />
                </div>
            </div>

            <CustomButton 
                onClick={handlePurchase} 
                disabled={isPending || pin.length < 4} 
                className="w-full mt-8 h-12"
            >
                {isPending ? <Loader2 className="animate-spin size-5" /> : "Complete Purchase"}
            </CustomButton>
        </section>
    );
};

export default Checkout;
