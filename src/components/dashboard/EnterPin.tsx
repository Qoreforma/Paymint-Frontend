import { useEffect, useRef } from "react";
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
    onValueChange: React.Dispatch<React.SetStateAction<string>> | ((value: string) => void);
    disable?: boolean;
    inline?: boolean;
    showSubmitButton?: boolean;
}

const EnterPin = ({ 
    isOpen = true, 
    onClose, 
    handleSubmit, 
    value, 
    onValueChange, 
    disable, 
    noOfDigits = 4,
    inline = false,
    showSubmitButton = !inline,
}: TEnterPin) => {
    const { user } = useAuth();
    const lastSubmittedPinRef = useRef<string | null>(null);
    const handleSubmitRef = useRef(handleSubmit);

    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    });

    // Reset submission lock whenever user changes or clears PIN
    useEffect(() => {
        if (value.length < noOfDigits) {
            lastSubmittedPinRef.current = null;
        }
    }, [value, noOfDigits]);
    
    // Auto-submit when all digits are entered once without duplicates
    useEffect(() => {
        if (value.length === noOfDigits && !disable && lastSubmittedPinRef.current !== value) {
            // Slight delay to allow the last dot to render before submitting
            const timeout = setTimeout(() => {
                if (lastSubmittedPinRef.current !== value && !disable) {
                    lastSubmittedPinRef.current = value;
                    handleSubmitRef.current();
                }
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [value, noOfDigits, disable]);

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (value.length === noOfDigits && !disable && lastSubmittedPinRef.current !== value) {
            lastSubmittedPinRef.current = value;
            handleSubmitRef.current(e);
        }
    }

    const formContent = (
        <form onSubmit={handleFormSubmit} className="w-full flex flex-col items-center">
            <InputOTP 
                pattern={REGEXP_ONLY_DIGITS} 
                maxLength={noOfDigits}
                value={value}
                onChange={(val) => onValueChange(val)}
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
            {showSubmitButton && (
                <CustomButton isLoading={disable} disabled={value.length < noOfDigits || disable} className="w-full mt-8 md:mt-10 h-12 text-base">
                    Confirm Payment
                </CustomButton>
            )}
        </form>
    );

    if (!user?.pinActivatedAt) {
        if (inline) {
            return (
                <div className="w-full flex flex-col items-center p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                    <p className="text-[var(--aqua)] font-medium text-lg">Transaction PIN Required</p>
                    <p className="text-slate-500 text-sm mt-1 mb-4">You need to set up a transaction PIN first before confirming payments.</p>
                    <CustomButton variant="primary" href="/dashboard/settings/security" className="w-full text-center">
                        Go to Security Settings
                    </CustomButton>
                </div>
            );
        }

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

    if (inline) {
        return formContent;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && onClose && !disable) {
                lastSubmittedPinRef.current = null;
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
                {formContent}
            </DialogContent>
        </Dialog>
    )
}

export default EnterPin;