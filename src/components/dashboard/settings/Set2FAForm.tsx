import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";

import CustomButton from "@/components/CustomButton"
import { verifyEmailSchema } from "@/lib/zodSchemas/auth.schema";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { send2faCode } from "@/lib/api/dashboard-apis/settingsApis";
import { toast } from "sonner";
import { AxiosError } from "axios";

type TFormData = z.infer<typeof verifyEmailSchema>;

type TSet2FAForm = {
    closeModal: () => void
}

const Set2FAForm = ({closeModal}: TSet2FAForm ) => {
    const [countdown, setCountdown] = useState(0);

    const {user} = useAuth()
 
     const {
         register,
         watch,
         handleSubmit,
         formState: {errors}
     } = useForm<TFormData>({
         resolver: zodResolver(verifyEmailSchema),
         defaultValues: {
            email: user?.email
         }
     })
 
     const emailInput = watch("email");

    const {mutate: sendVerCode, isPending: sendingCode} = useMutation({
        mutationFn: send2faCode,
        onSuccess: () => {
            toast.success("An OTP has been sent to your mail")

            setCountdown(60); // Start countdown
            const interval = setInterval(() => {
                setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
                });
            }, 1000);
        },
        onError: (error: AxiosError) => {
            const errData = error.response?.data as { message?: string };
            if(errData.message){
                return toast.error(errData.message)
            }
            toast.error("Something went wrong, please try again")
        }
    })
     
    const sendCode = () => {
        if(countdown > 0) {
            return toast.info(`Try again in ${countdown}s`)
        }

        if (!emailInput) {
            toast.info("Please input the email linked to this account")
            return
        }
        
        sendVerCode({email: emailInput})
    }
 
     const onSubmit = (data: TFormData) => {
         console.log(data)

         closeModal();
     }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="w-full">
            <label className="text-[#344054] text-sm font-medium mb-2" htmlFor="lastname">Email Address</label>
            <div className="relative">
                <input id="email" {...register("email")} type="email" placeholder="enter email address" className="w-full outline-0 bg-white py-2.5 px-3.5 border border-[#D0D5DD] shadow-[#1018280D] placeholder:text-sm placeholder:text-[#667085] rounded-md mt-1.5 focus:border-[var(--aqua)] transition" />
                {
                    sendingCode ? (
                        <LoaderCircle className="animate-spin size-4 text-[12008F] absolute top-1/3 right-3.5" />
                    ) : (
                        <button type="button" onClick={sendCode} className="cursor-pointer text-[var(--aqua)] text-sm absolute top-1/3 right-3.5 hover:opacity-80 transition">Send code</button>
                    )
                }
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div className="w-full mt-5">
            <label className="text-[#344054] text-sm font-medium" htmlFor="lastname">Input code</label>
            <input {...register("code")} placeholder="--- ---" className="w-full outline-0 bg-white py-2.5 px-3 border border-[#D0D5DD] shadow-[#1018280D] placeholder:text-[#667085] rounded-md mt-2 focus:border-[var(--aqua)] transition" />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
        </div>
        <CustomButton disabled={sendingCode} className="w-full mt-6">Activate</CustomButton>
    </form>
  )
}

export default Set2FAForm