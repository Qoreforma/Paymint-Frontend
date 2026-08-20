import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import CustomButton from "../CustomButton"
import { logInFormSchema } from "@/lib/zodSchemas/auth.schema"
import { z } from "zod"

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth, User } from "@/context/AuthContext"
import { LogInUser } from "@/lib/api/authApi"
import { AxiosError } from "axios"
import GoogleLoginButton from "./GoogleLoginButton"

export type TFormData = z.infer<typeof logInFormSchema>;

const LogInForm = () => {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate()
    const { setAuthData } = useAuth()

    const { mutate, isPending: isLoggingIn } = useMutation({
        mutationFn: LogInUser,
        onSuccess: (data, variables) => {
            if (data.error === "TWO_FA_REQUIRED") {
                return navigate("/auth/two-factor-authentication", {
                    state: { email: variables.payload.email },
                })
            }

            const user = data.data.user as User;
            const accessToken = data.data.accessToken;
            const refreshToken = data.data.refreshToken;

            setAuthData(user, accessToken, refreshToken)
            reset();
            toast.success(data.message || "Logged in successfully")
            navigate("/dashboard")
        },
        onError: (error: AxiosError, variables) => {
            if (error?.response?.status === 403) {
                navigate(`/auth/verify-email`, {
                    state: { email: variables.payload.email }
                })
            }
            const errData = error.response?.data as { message?: string };
            if (errData.message) {
                return toast.error(errData.message)
            }
            toast.error("Something went wrong, please try again")
        }
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<TFormData>({
        resolver: zodResolver(logInFormSchema)
    })

    const onSubmit = (data: TFormData) => {
        mutate({ payload: data })
    }

    return (
        <div className="w-full text-center">
            <h2 className="text-3xl sm:text-4xl text-[#101828] font-bold">
                Welcome <span role="img" aria-label="wave">👋</span>
            </h2>
            <p className="mt-3 text-[#667085]">Sign in to pay bills, buy airtime &amp; data</p>

            <form autoComplete="on" onSubmit={handleSubmit(onSubmit)} className="mt-6 w-full text-left">
                {/* Card wraps only the inputs now */}
                <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(16,24,40,0.06)] p-5 sm:p-6">
                    <div className="w-full">
                        <label className="text-[#344054] text-sm font-medium" htmlFor="email">Email Address</label>
                        <input id="email" {...register("email")} type="email" placeholder="Enter your email address" className="w-full outline-0 bg-white py-2.5 px-3.5 border border-[#D0D5DD] placeholder:text-[#667085] rounded-md mt-1.5 focus:border-[var(--aqua)] transition" autoComplete="email" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="w-full mt-5">
                        <label className="text-sm text-[#344054] font-medium" htmlFor="password">Password</label>
                        <div className="w-full h-fit relative mt-1.5">
                            <input {...register("password")} placeholder="••••••••" className="w-full border border-[#D0D5DD] rounded-md py-2.5 px-3.5 pr-10 bg-white outline-none focus:border-[var(--aqua)] placeholder:text-sm placeholder:text-[#667085]" type={showPassword ? "text" : "password"} id="password" autoComplete="current-password" />
                            <button onClick={() => setShowPassword(prev => !prev)} type="button" className="absolute cursor-pointer text-[#98A2B3] right-3.5 top-1/2 -translate-y-1/2">
                                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center">
                            <input type="checkbox" id="terms" className="w-4 h-4 accent-[var(--aqua)] cursor-pointer" />
                            <label htmlFor="terms" className="text-[#344054] text-sm font-medium ml-2">Remember me</label>
                        </div>
                        <Link to="/auth/reset-password" className="font-medium text-[var(--aqua)] text-sm hover:opacity-80 transition">Forgot Password?</Link>
                    </div>
                </div>

                <CustomButton isLoading={isLoggingIn} disabled={isLoggingIn} className="w-full mt-6">Log In</CustomButton>

                <div className="mt-6 flex items-center justify-center gap-1">
                    <p className="text-sm text-[#667085]">Don&apos;t have an account?</p>
                    <Link to="/auth/signup" className="font-semibold text-[var(--aqua)] hover:opacity-80 transition cursor-pointer">Create one</Link>
                </div>

                {/* SOCIAL LOG IN BUTTONS */}
                <GoogleLoginButton disabled={isLoggingIn} />
            </form>
        </div>
    )
}

export default LogInForm