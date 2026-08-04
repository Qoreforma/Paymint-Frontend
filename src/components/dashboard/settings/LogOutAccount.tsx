import { useState } from "react";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { Logout } from "@/lib/api/authApi";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import CustomButton from "@/components/CustomButton";

const LogOutAccount = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const { clearAuthData } = useAuth();

  const { mutate, isPending: isLoggingOut } = useMutation({
    mutationFn: Logout,
    onSuccess: () => {
      toast.success("Logged out.");
      clearAuthData();
    },
    onError: (error: AxiosError) => {
      const errData = error.response?.data as { message?: string };
      if (errData?.message) return toast.error(errData.message);
      toast.error("Something went wrong, please try again");
    },
  });

  return (
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogTrigger asChild>
        <button className="flex items-center gap-4 px-5 py-4 w-full hover:bg-slate-50 transition-colors group cursor-pointer text-left">
          <div className="size-10 rounded-xl border bg-amber-50 text-amber-600 border-amber-100 flex items-center justify-center shrink-0">
            <LogOut className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-display font-semibold text-sm text-slate-900 block">Log Out</span>
            <span className="text-xs text-slate-500">Sign out of your PayMint account</span>
          </div>
          <div className="size-2 rounded-full bg-amber-400 shrink-0 opacity-70" />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white border-0 rounded-3xl w-[92vw] !max-w-[400px] !p-8">
        <div className="flex flex-col items-center text-center">
          <div className="size-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mb-5 border border-amber-100">
            <LogOut className="size-7" />
          </div>
          <AlertDialogHeader className="gap-0">
            <AlertDialogTitle className="text-slate-900 text-xl font-bold text-center">
              Log out?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm mt-2 text-center leading-relaxed">
              You'll be signed out of your account. Any unsaved changes will be lost and you'll need to log in again to access PayMint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col w-full gap-2.5 mt-6">
            <CustomButton
              disabled={isLoggingOut}
              onClick={() => setOpenDialog(false)}
              className="w-full"
            >
              Cancel
            </CustomButton>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => mutate()}
              className="w-full h-11 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out…" : "Yes, Log Out"}
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogOutAccount;