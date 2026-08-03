import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Loader2, Check } from "lucide-react";
import useAirtimePrintStore from "@/stores/useAirtimePrintStore";
import { useQuery } from "@tanstack/react-query";
import { getAirtimeEpinReceipt } from "@/lib/api/dashboard-apis/servicesApis";
import SuccessIcon from "@/assets/dashboard/success_icon.svg";

import CustomButton from "@/components/CustomButton";

const Receipt = () => {
    const { txnResult, reset } = useAirtimePrintStore();
    const navigate = useNavigate();
    const [copiedPin, setCopiedPin] = useState<string | null>(null);

    const { data: receiptData, isLoading } = useQuery({
        queryKey: ["airtime-epin-receipt", txnResult?.reference],
        queryFn: () => getAirtimeEpinReceipt(txnResult?.reference as string),
        enabled: !!txnResult?.reference
    });

    const handleCopy = (pin: string) => {
        navigator.clipboard.writeText(pin);
        setCopiedPin(pin);
        setTimeout(() => setCopiedPin(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin size-8 text-[var(--aqua)] mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Generating your pins...</p>
            </div>
        );
    }

    const pins = receiptData?.pins || [];

    return (
        <section className="w-full max-w-[400px] mx-auto pb-8 pt-5 px-4">
            <div className="flex flex-col items-center justify-center text-center">
                <img src={SuccessIcon} alt="Success" className="size-20 mb-4" />
                <h1 className="text-2xl font-bold text-[#101828]">Purchase Successful!</h1>
                <p className="text-[#667085] mt-2 mb-6">You have successfully generated {pins.length} airtime pin(s).</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Transaction Ref</span>
                    <span className="text-sm font-mono text-slate-800">{txnResult?.reference}</span>
                </div>

                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {pins.map((pinItem: any, idx: number) => (
                        <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-slate-700">Pin {idx + 1}</span>
                                <span className="text-xs font-bold text-[var(--brand-ink)] bg-[var(--brand-ink)]/10 px-2 py-1 rounded">
                                    ₦{pinItem.amount}
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-2 mt-2">
                                <span className="font-mono text-lg font-bold tracking-widest text-slate-800">{pinItem.pin}</span>
                                <button 
                                    onClick={() => handleCopy(pinItem.pin)}
                                    className="p-2 hover:bg-slate-100 rounded text-slate-500 transition"
                                >
                                    {copiedPin === pinItem.pin ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                                </button>
                            </div>
                            {pinItem.serialNumber && (
                                <p className="text-xs text-slate-500 mt-2 font-mono text-center">SN: {pinItem.serialNumber}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <CustomButton 
                    onClick={() => {
                        reset();
                        navigate("/dashboard");
                    }}
                    className="w-full"
                >
                    Back to Dashboard
                </CustomButton>
            </div>
        </section>
    );
};

export default Receipt;
