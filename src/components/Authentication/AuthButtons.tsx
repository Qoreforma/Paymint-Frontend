import { useAuth } from "@/context/AuthContext";
import CustomButton from "../CustomButton";
import { useMutation } from "@tanstack/react-query";
import { Logout } from "@/lib/api/authApi";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";

const AuthButtons = () => {
    const {accessToken, clearAuthData} = useAuth();

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
    <>
        <div className="flex justify-start items-center gap-3">
          {!accessToken ? (
            <>
              <CustomButton href="/auth/login" variant="primary">Log in</CustomButton>
              <CustomButton href="/auth/signup">SignUp</CustomButton>
            </>
          ) : (
            <>
              <CustomButton disabled={isLoggingOut} onClick={() => mutate()} variant="primary" className="flex items-center gap-1.5">Log out {isLoggingOut && <Loader2 className="animate-spin size-4" />}</CustomButton>
              <CustomButton href="/dashboard">Dashboard</CustomButton>
            </>
          )
        }
        </div>
    </>
  )
}

export default AuthButtons;