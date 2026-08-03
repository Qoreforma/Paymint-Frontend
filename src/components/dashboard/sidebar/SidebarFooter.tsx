import { GoSignOut } from "react-icons/go";

import VerifiedIcon from "@/assets/dashboard/verified_tick.png";
import { useMutation } from "@tanstack/react-query";
import { Logout } from "@/lib/api/authApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import UserAvatar from "@/components/ui/UserAvatar";

const SidebarFooter = () => {
    const {clearAuthData, user} = useAuth()

    const {mutate, isPending: isLoggingOut} = useMutation({
        mutationFn: Logout,
        onSuccess: (data) => {
            clearAuthData();
            console.log({data})
            toast.success("Logged out.")
        },
        onError: (error: AxiosError) => {
            console.log({error})
            const errData = error.response?.data as { message?: string };
            if(errData.message){
                return toast.error(errData.message)
            }
            toast.error("Something went wrong, please try again")
        }
    })
  return (
    <footer className="pt-4 pb-4 mt-auto border-t border-dashed border-slate-200 bg-slate-50/70 mx-2 mb-3 p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between gap-2 w-full">
            <Link className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity" to="/dashboard/settings/account">
                <div className="relative size-10 shrink-0">
                    <UserAvatar user={user} className="size-10 bg-blue-100 text-blue-700 font-bold" />
                    <img src={VerifiedIcon} className="size-4 object-cover absolute -right-0.5 -bottom-0.5 drop-shadow-sm" alt="verified" />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                    <h2 className="font-semibold text-sm text-slate-800 truncate capitalize leading-tight">
                        {user?.firstname} {user?.lastname}
                    </h2>
                    <p className="text-xs text-slate-400 truncate mt-0.5">@{user?.username}</p>
                </div>
            </Link>

            {isLoggingOut ? (
                <Loader2 className="animate-spin text-slate-400 size-4 shrink-0" />
            ) : (
                <button 
                    onClick={() => mutate()} 
                    title="Log out"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                    <GoSignOut className="size-4" />
                </button>
            )}
        </div>
    </footer>
  )
}

export default SidebarFooter;