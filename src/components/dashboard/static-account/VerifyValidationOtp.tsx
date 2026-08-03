import React, { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { toast } from "sonner";
import { 
  KeyRound, 
  ArrowRight, 
  Loader2, 
  ArrowLeft,
  ShieldCheck
} from "lucide-react";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/context/AuthContext";
import { getUser } from "@/lib/api/authApi";
import { validateIdentityOtp } from "@/lib/api/dashboard-apis/staticAccountApis";

interface VerifyValidationOtpProps {
    setShowVerifyForm: React.Dispatch<React.SetStateAction<boolean>>;
    setIdentityId: React.Dispatch<React.SetStateAction<string | null>>;
    identityId: string | null;
}

const VerifyValidationOtp: React.FC<VerifyValidationOtpProps> = ({
    setShowVerifyForm,
    identityId,
    setIdentityId
}) => {
    const [otp, setOtp] = useState<string>("");
    const { setAuthData, accessToken, refreshToken } = useAuth();

    const { mutate: verifyBvnOtp, isPending: isVerifying } = useMutation({
        mutationFn: validateIdentityOtp,
        onSuccess: async () => {
            try {
                const updatedUser = await getUser();
                setAuthData(updatedUser, accessToken as string, refreshToken as string);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
            setOtp("");
            toast.success("BVN identity verified & static account generated!");
            setShowVerifyForm(false);
            setIdentityId(null);
        },
        onError: (error: AxiosError) => {
            const errData = error.response?.data as { message?: string };
            if (errData.message) {
                return toast.error(errData.message);
            }
            toast.error("Something went wrong, please try again");
        }
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (otp.length < 6 || !identityId) return;
        verifyBvnOtp({ identityId, otp });
    };

    return (
        <section className="w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <KeyRound className="size-6" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900">OTP Identity Verification</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Authorize account generation with your BVN security code</p>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-xs text-slate-600 flex items-center gap-3">
                <ShieldCheck className="size-5 text-blue-600 shrink-0" />
                <span>An OTP has been sent to the phone number linked to your BVN by NIBSS.</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        6-Digit Security Code
                    </label>
                    <InputOTP
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        disabled={isVerifying}
                        autoFocus
                    >
                        <InputOTPGroup className="flex gap-2 md:gap-3 justify-center w-full">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <InputOTPSlot
                                    key={index}
                                    className="border-2 border-slate-200 rounded-xl size-11 md:size-14 text-2xl font-bold font-mono text-slate-800 bg-white transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                                    index={index}
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <button
                    type="submit"
                    disabled={otp.length < 6 || isVerifying}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 active:scale-[0.99] cursor-pointer"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="animate-spin size-5" />
                            Creating Account...
                        </>
                    ) : (
                        <>
                            Verify & Create Account
                            <ArrowRight className="size-5" />
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setShowVerifyForm(false)}
                    className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    Back to BVN Entry
                </button>
            </form>
        </section>
    );
};

export default VerifyValidationOtp;