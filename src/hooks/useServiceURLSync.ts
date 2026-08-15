import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

interface UseServiceURLSyncProps {
    step: number;
    updateStep: (step: number) => void;
    reset: () => void;
}

export const useServiceURLSync = ({ step, updateStep, reset }: UseServiceURLSyncProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const hasInitialized = useRef(false);
    const lastWrittenStep = useRef<number | null>(null);
    const updateStepRef = useRef(updateStep);
    const resetRef = useRef(reset);

    // Keep callbacks fresh in ref to avoid triggering effects on new function instances
    useEffect(() => {
        updateStepRef.current = updateStep;
        resetRef.current = reset;
    });

    // 1. Initial Mount: sync URL to Store or reset (runs ONCE on mount)
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            const urlStep = searchParams.get("step");
            if (urlStep && !isNaN(Number(urlStep))) {
                const parsedStep = Number(urlStep);
                if (parsedStep !== step) {
                    updateStepRef.current(parsedStep);
                }
                lastWrittenStep.current = parsedStep;
            } else {
                resetRef.current();
                lastWrittenStep.current = 1;
                setSearchParams({ step: "1" }, { replace: true });
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 2. Internal Store step change -> sync to URL (only when step actually changes)
    useEffect(() => {
        if (hasInitialized.current) {
            const urlStep = searchParams.get("step");
            const currentUrlStep = urlStep ? Number(urlStep) : 1;
            if (currentUrlStep !== step && lastWrittenStep.current !== step) {
                lastWrittenStep.current = step;
                setSearchParams((prev) => {
                    const newParams = new URLSearchParams(prev);
                    newParams.set("step", step.toString());
                    return newParams;
                });
            }
        }
    }, [step]); // Only depend on store step

    // 3. Browser Back / Forward buttons -> sync URL back to store
    useEffect(() => {
        if (hasInitialized.current) {
            const urlStep = searchParams.get("step");
            if (urlStep && !isNaN(Number(urlStep))) {
                const parsedStep = Number(urlStep);
                if (parsedStep !== step && lastWrittenStep.current !== parsedStep) {
                    lastWrittenStep.current = parsedStep;
                    updateStepRef.current(parsedStep);
                }
            }
        }
    }, [searchParams]); // Only depend on searchParams
};
