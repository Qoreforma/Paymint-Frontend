import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { deactivateAccount } from "@/lib/api/authApi";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import CustomButton from "@/components/CustomButton";

const DeactivateAccount = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const { clearAuthData } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: deactivateAccount,
    onSuccess: () => {
      toast.success("Account deactivated.");
      setOpenDialog(false);
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
        <button className="flex items-center gap-4 px-5 py-4 w-full hover:bg-rose-50/50 transition-colors group cursor-pointer text-left">
          <div className="size-10 rounded-xl border bg-rose-50 text-rose-500 border-rose-100 flex items-center justify-center shrink-0">
            <Trash2 className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-display font-semibold text-sm text-rose-600 block">
              Close Account
            </span>
            <span className="text-xs text-slate-500">
              Permanently delete your PayMint account
            </span>
          </div>
          <div className="size-2 rounded-full bg-rose-400 shrink-0 opacity-70" />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white border-0 rounded-3xl w-[92vw] !max-w-[400px] !p-8">
        <div className="flex flex-col items-center text-center">
          <div className="size-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5 border border-rose-100">
            <Trash2 className="size-7" />
          </div>
          <AlertDialogHeader className="gap-0">
            <AlertDialogTitle className="text-slate-900 text-xl font-bold text-center">
              Delete account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm mt-2 text-center leading-relaxed">
              Once your account is closed, all your data and payment history will be permanently deleted. You will lose access to all PayMint services. This action{" "}
              <span className="font-semibold text-rose-600">cannot be undone</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col w-full gap-2.5 mt-6">
            <CustomButton
              disabled={isPending}
              onClick={() => setOpenDialog(false)}
              className="w-full"
            >
              Cancel
            </CustomButton>
            <button
              type="button"
              disabled={isPending}
              onClick={() => mutate()}
              className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 shadow-sm shadow-rose-200"
            >
              {isPending ? "Deleting account…" : "Yes, Delete My Account"}
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeactivateAccount;