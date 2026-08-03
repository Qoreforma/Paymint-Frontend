import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { 
  User, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Check, 
  ArrowRight, 
  Loader2,
  Info
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CreateStaticAccountForm } from "@/lib/zodSchemas/dashboard.schema";
import { validateIdentity } from "@/lib/api/dashboard-apis/staticAccountApis";
import { getUser } from "@/lib/api/authApi";
import { useAuth } from "@/context/AuthContext";
import VerifyValidationOtp from "./VerifyValidationOtp";

type TFormData = z.infer<typeof CreateStaticAccountForm>;
const currentDate = new Date(Date.now());

const CreateStaticAccount = () => {
    const [dob, setDob] = useState<Date | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [showVerifyForm, setShowVerifyForm] = useState<boolean>(false);
    const [identityId, setIdentityId] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const { setAuthData, accessToken, refreshToken } = useAuth();

    const handleOpenPicker = () => {
        if (inputRef.current) {
            inputRef.current.showPicker();
        }
    };

    const handleDatePicker = (value: Date) => {
        if (value > currentDate) {
            toast.info("You cannot select a date in the future");
            return;
        }
        setDob(value);
    };

    const { mutate: verifyBvn, isPending: isVerifying } = useMutation({
        mutationFn: validateIdentity,
        onSuccess: async (data: any) => {
            setDob(null);
            setVerifyError(null);
            
            if (data?.data?.isOtpRequired) {
                toast.info("An OTP has been sent to the phone number linked with your BVN.");
                setIdentityId(data?.data?.identityId);
                setShowVerifyForm(true);
            } else {
                toast.success(data?.message || "Static account created successfully!");
                try {
                    const updatedUser = await getUser();
                    setAuthData(updatedUser, accessToken as string, refreshToken as string);
                } catch (err) {
                    console.error("Failed to fetch user:", err);
                }
            }
        },
        onError: (error: AxiosError) => {
            const errData = error.response?.data as { message?: string };
            if (errData.message) {
                return setVerifyError(errData.message);
            }
            toast.error("Something went wrong, please try again");
        }
    });

    const {
        register,
        formState: { errors },
        handleSubmit,
        watch
    } = useForm<TFormData>({
        resolver: zodResolver(CreateStaticAccountForm)
    });

    const acceptTerms = watch("accept_terms");

    const onSubmit = (data: TFormData) => {
        if (!dob) {
            toast.error("Please select your date of birth");
            return;
        }

        const firstname = data.fullname.trim().split(" ")[0];
        const lastname = data.fullname.trim().split(" ").slice(1).join(" ") || "";
        const dateOfBirth = formatDate(dob, "yyyy-MM-dd");

        setVerifyError(null);
        verifyBvn({ dateOfBirth, firstname, lastname, value: data.bvn });
    };

    if (showVerifyForm) {
        return (
            <VerifyValidationOtp
                identityId={identityId}
                setIdentityId={setIdentityId}
                setShowVerifyForm={setShowVerifyForm}
            />
        );
    }

    return (
        <section className="w-full">
            {/* Header Block */}
            <div className="flex items-center gap-4 mb-8">
                <div className="size-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck className="size-6" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900">Create Static Account</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Verify your identity to generate your dedicated bank account</p>
                </div>
            </div>

            {verifyError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <Info className="size-4 shrink-0 text-red-500" />
                    <span>{verifyError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div className="w-full">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="fullname">
                        Full Name (as registered on BVN)
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <User className="size-5" />
                        </div>
                        <input
                            {...register("fullname")}
                            placeholder="e.g. Opafunso Benjamin Oluwaferanmi"
                            className="w-full h-14 border border-slate-200 rounded-xl py-4 pl-11 pr-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 text-slate-800 transition-all shadow-xs text-sm"
                            type="text"
                            id="fullname"
                        />
                    </div>
                    {errors.fullname && <p className="text-red-500 text-xs mt-1.5">{errors.fullname.message}</p>}
                </div>

                {/* Date of Birth */}
                <div className="w-full">
                    <label className="text-sm font-medium text-slate-700 block mb-2" htmlFor="dob">
                        Date of Birth
                    </label>
                    <div
                        onClick={handleOpenPicker}
                        className={cn(
                            "w-full h-14 cursor-pointer flex items-center px-4 justify-between border border-slate-200 rounded-xl bg-white outline-none focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 transition-all shadow-xs",
                            !dob && "text-slate-400"
                        )}
                    >
                        <input
                            ref={inputRef}
                            type="date"
                            onKeyDown={(e) => e.preventDefault()}
                            value={dob ? dob.toISOString().split("T")[0] : ""}
                            onChange={(e) => handleDatePicker(new Date(e.target.value))}
                            className="bg-transparent cursor-pointer outline-none border-none flex-1 text-slate-800 text-sm font-normal"
                        />
                        <Calendar className="size-5 text-slate-400 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Select the date of birth associated with your BVN</p>
                </div>

                {/* BVN Input */}
                <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="bvn">
                            Bank Verification Number (BVN)
                        </label>
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                            <Lock className="size-3" /> Encrypted
                        </span>
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Lock className="size-5" />
                        </div>
                        <input
                            {...register("bvn")}
                            placeholder="Enter 11-digit BVN"
                            maxLength={11}
                            className="w-full h-14 border border-slate-200 rounded-xl py-4 pl-11 pr-4 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 font-mono tracking-widest text-slate-800 transition-all shadow-xs text-sm"
                            type="text"
                            id="bvn"
                        />
                    </div>
                    {errors.bvn && <p className="text-red-500 text-xs mt-1.5">{errors.bvn.message}</p>}
                </div>

                {/* Terms Checkbox */}
                <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group select-none">
                        <input {...register("accept_terms")} type="checkbox" className="peer hidden" />
                        <div className="size-5 border border-slate-300 rounded-md transition-all duration-200 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:[&>svg]:opacity-100 mt-0.5 shrink-0">
                            <Check className="size-3.5 text-white opacity-0 transition-opacity duration-200" />
                        </div>
                        <span className="text-xs text-slate-600 leading-relaxed">
                            I consent to PayMint verifying my identity details with NIBSS in accordance with CBN regulatory standards.
                        </span>
                    </label>
                    {errors.accept_terms && <p className="text-red-500 text-xs mt-1">{errors.accept_terms.message}</p>}
                </div>

                {/* Trust Badge Banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-600">
                    <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="size-4" />
                    </div>
                    <p>Your BVN is encrypted and used exclusively for identity verification. We never store raw security credentials.</p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isVerifying || !acceptTerms}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 active:scale-[0.99] cursor-pointer"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="animate-spin size-5" />
                            Verifying Identity...
                        </>
                    ) : (
                        <>
                            Proceed to Verify BVN
                            <ArrowRight className="size-5" />
                        </>
                    )}
                </button>
            </form>
        </section>
    );
};

export default CreateStaticAccount;