import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";

import { LuShield } from "react-icons/lu";
import { cn } from "@/lib/utils";
import Set2FAForm from "./Set2FAForm";
import BackButton from "@/components/Authentication/BackButton";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggle2fa } from "@/lib/api/dashboard-apis/settingsApis";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { LoaderCircle } from "lucide-react";
import { getUser } from "@/lib/api/authApi";

const Set2FAModal = () => {
    const [openDialog, setOpenDialog] = useState(false);
    
    const {user, setAuthData, accessToken, refreshToken} = useAuth();
    
    const closeModal = () => setOpenDialog(false);

    const {mutate: set2fa, isPending} = useMutation({
        mutationFn: toggle2fa,
        onSuccess: async (data) => {
            try {
                const updatedUser = await getUser();
                console.log("Updated user:", updatedUser);
                setAuthData(updatedUser, accessToken as string, refreshToken as string);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
            toast.success(data.message)
        },
        onError: (error: AxiosError) => {
            const errData = error.response?.data as { message?: string };
            if(errData.message){
                return toast.error(errData.message)
            }
            toast.error("Something went wrong, please try again")
        }
    })


    const handle2FASelect = () => {
        const value = !user?.twofactorEnabled;
        set2fa({enable: value!});
    }

  return (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <button disabled={isPending} className="cursor-pointer flex items-center gap-[9px] py-3.5 pr-3.5 text-[#344054] border-b-[0.1px] border-[#667085]/30 transition">
                <LuShield className="size-4" />
                <span className="text-[13px]">{user?.twofactorEnabled ? "Disable 2FA" : "Enable 2FA"}</span>
                
                    {
                        isPending ?
                         <LoaderCircle className="animate-spin size-4 text-[12008F] ml-auto" /> : 
                         <div onClick={handle2FASelect} className={cn("w-[25px] h-[15px] rounded-full border-2 ml-auto flex items-center relative cursor-pointer transition-all")}>
                            <div className={cn("h-[80%] aspect-square rounded-full bg-[var(--aqua)] absolute transition-all duration-500", user?.twofactorEnabled ? "right-[1.5px]" : "left-[1.5px]")} />
                         </div>
                    }

            </button>

            <AlertDialogContent className="bg-white border-0 rounded-lg w-[95vw] !max-w-[430px] h-auto !md:min-h-[476px] !p-0 md:!p-10">
                <div className="w-full flex items-center h-[61px] md:hidden border-b border-[#E9E9E97D] px-4">
                    <BackButton icon action={() => setOpenDialog(false)} />
                    <p className="text-[#1C1C1C] text-lg w-full text-center mr-6">2FA</p>
                </div>
                <div className="w-[90%] max-w-[350px] mx-auto max-md:pb-5">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex flex-col justify-center max-md:text-left">
                            <BackButton action={() => setOpenDialog(false)} className="mb-8 max-md:hidden" />
                            <span className="text-[var(--aqua)] font-medium md:font-bold text-[22px] md:text-[28px]">2FA</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[var(--ink)] max-md:text-left">
                            Secure your account
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mt-8">
                        <Set2FAForm closeModal={closeModal} />
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
  )
}

export default Set2FAModal;