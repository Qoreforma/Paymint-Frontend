import { useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/context/AuthContext";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TEnterPin = {
    isOpen?: boolean;
    onClose?: () => void;
    handleSubmit: (e?: FormEvent) => void;
    value: string;
    noOfDigits?: number;
    onValueChange: React.Dispatch<React.SetStateAction<string>>;
    disable?: boolean;
}

const EnterPin = ({ isOpen = true, onClose, handleSubmit, value, onValueChange, disable, noOfDigits = 4 }: TEnterPin) => {
    const { user } = useAuth();
    
    // Auto-submit when all digits are entered
    useEffect(() => {
        if (value.length === noOfDigits && !disable) {
            // Slight delay to allow the last dot to render before submitting
            const timeout = setTimeout(() => {
                handleSubmit();
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [value, noOfDigits, disable, handleSubmit]);

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSubmit(e);
    }

    if (!user?.pinActivatedAt) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
                <DialogContent className="sm:max-w-md w-[90%] rounded-2xl md:rounded-3xl mx-auto p-8 gap-0 bg-white border border-slate-100 shadow-2xl outline-none">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-[var(--aqua)] font-medium text-2xl text-center">Set Transaction pin</DialogTitle>
                        <DialogDescription className="text-center">You need to set a transaction pin first.</DialogDescription>
                    </DialogHeader>
                    <CustomButton variant="primary" href="/dashboard/settings/security" className="w-full mt-4 text-center">
                        Go to Security Settings
                    </CustomButton>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && onClose && !disable) {
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-md w-[90%] rounded-2xl md:rounded-3xl mx-auto p-6 md:p-8 gap-0 bg-white border border-slate-100 shadow-2xl outline-none">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-[var(--aqua)] font-medium text-2xl text-center">Confirm Payment</DialogTitle>
                    <DialogDescription className="text-center mt-2 text-[#717171] text-sm md:text-base">
                        Enter your {noOfDigits}-digit transaction pin to confirm this payment
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleFormSubmit} className="w-full flex flex-col items-center">
                    <InputOTP 
                        pattern={REGEXP_ONLY_DIGITS} 
                        maxLength={noOfDigits}
                        value={value}
                        onChange={(value) => onValueChange(value)}
                        disabled={disable}
                        autoFocus
                    >
                        <InputOTPGroup className="flex w-full justify-center gap-2 md:gap-4">
                           {Array.from({length: noOfDigits}).map((_, index) => (
                               <InputOTPSlot 
                                   key={index} 
                                   className="border !rounded-xl size-14 md:size-16 text-3xl md:text-4xl text-[#667085] font-medium bg-slate-50 transition-all focus:ring-2 focus:ring-[var(--aqua)] focus:bg-white" 
                                   index={index} 
                               />
                           ))}
                        </InputOTPGroup>
                    </InputOTP>
                    <CustomButton isLoading={disable} disabled={value.length < noOfDigits || disable} className="w-full mt-8 md:mt-10 h-12 text-base">
                        Confirm Payment
                    </CustomButton>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EnterPin;