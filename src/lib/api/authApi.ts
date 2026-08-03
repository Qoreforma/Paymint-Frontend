import { ICountry } from "@/routes/auth-pages/UserDetails";
import api from "./axios";

import { TFormData as SignUpFormData} from "@/components/Authentication/SignUpForm";

type TProfilePayload = {
    username?: string;
    gender?: string;
    country?: string;
    state?: string;
    fcmToken?: string;
}

type TSendPhoneCodePayload = {
    phoneCode: string;
    phone: string;
}
type TVerifyPhoneNoPayload = {
    phone: string;
    otp: string;
}

type LogInFormData = {
    email?: string;
    password?: string;
}

type GoogleAuthPayload = {
    googleIdToken: string;
    fcmToken?: string;
}

export const SignUpUser = async (payload: SignUpFormData) => {
    const res = await api.post("/auth/register", payload)
    console.log({payload})
    return res.data;
}

export const LogInUser = async ({payload}: {payload: LogInFormData}) => {
    const res = await api.post(`/auth/login`, payload)
    return res.data;
}

export const SignInWithGoogle = async ({payload}: {payload: GoogleAuthPayload}) => {
    const res = await api.post(`/auth/social/google/signin`, payload)
    return res.data;
}

export const verify2FaOtp = async (payload: {otp: string, email: string}) => {
    const res = await api.post(
        "/auth/2fa/verify",
        payload
    )
    return res.data
}

export const resend2FaOtp = async (email: string) => {
    const res = await api.post(
        "/auth/2fa/resend", {email}
    )
    return res.data
}

export const Logout = async () => {
    const res = await api.post("/auth/logout")
    return res.data;
}

export const verifyEmail = async ({email, otp}:{email: string, otp: string}) => {
    const res = await api.post(
        "/auth/email/verify",
        {email, otp}
    )
    return res.data
}

export const resendOtpFn = async (email: string) => {
    const res = await api.post(
        "/auth/email/resend",
        {email}
    )
    return res.data
}

export const fetchCountries = async (): Promise<ICountry[]> => {
    const res = await api.get(
        "/reference/countries?page=1&limit=1000"
    )
    return res.data.data;
}

export const updateProfile = async (profilePayload: TProfilePayload) => {
    const res = await api.put("/profile", profilePayload)
    return res.data.data;
}

export const sendPhoneCode = async (sendPhoneCodePayload: TSendPhoneCodePayload) => {
    const res = await api.post("/auth/phone/resend", sendPhoneCodePayload)
    return res.data.data;
}

export const verifyPhoneNo = async (VerifyPhoneNoPayload: TVerifyPhoneNoPayload) => {
    const res = await api.post("/auth/phone/verify", VerifyPhoneNoPayload)
    return res.data.data;
}

export const setTransactionPin = async (pin: string) => {
    const res = await api.put("/auth/pin/set", {pin})
    return res.data;
}

export const changeTransactionPin = async ({newPin, oldPin}: {newPin: string, oldPin: string}) => {
    const res = await api.put("/auth/pin/change", {newPin, oldPin})
    return res.data;
}

export const resendPasswordOtp = async (email: string) => {
    const res = await api.post("/auth/forgot-password", {email})
    return res.data;
}

export const verifyPasswordToken = async ({email, token}: {email: string, token: string}) => {
    const res = await api.post("/auth/password/verify", {email, token})
    return res.data;
}

export const setNewPassword = async ({email, password, token}: {email: string; password: string; token: string}) => {
    const res = await api.post("/auth/reset-password", {gmail: email, otp: token, password})
    return res.data;
}

export const deactivateAccount = async () => {
    const res = await api.post("/profile/deactivate")
    return res.data;
}

export const getUser = async () => {
    const res = await api.get("/profile")
    return res.data.data;
}