import { useState } from "react";
import useServiceFlowStore from "@/stores/useServiceFlowStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { verifyAirtimeCashOtp } from "@/lib/api/dashboard-apis/servicesApis";

const VerifyOTP = () => {
    const { update, step, phone, provider } = useServiceFlowStore();
    const [otp, setOtp] = useState("");

    const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
        mutationFn: verifyAirtimeCashOtp,
        onSuccess: () => {
            toast.success("OTP verified successfully");
            update({ step: step + 1 });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid OTP");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;
        verifyOtp({ phone, network: provider, otp });
    };

    return (
        <section className="w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                   <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-semibold text-slate-800">Verify OTP</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Enter the OTP sent to {phone}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="w-full">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="otp">OTP</label>
                    <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full border border-slate-200 rounded-2xl py-4 px-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono text-lg font-semibold text-slate-800 transition-all shadow-sm"
                        type="text"
                        id="otp"
                    />
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => update({ step: step - 1 })}
                        disabled={isVerifying}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={!otp || isVerifying}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isVerifying ? <Loader2 className="animate-spin size-5" /> : "Verify OTP"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default VerifyOTP;
