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

    useEffect(() => {
        // On first mount, parse step from URL or reset if none exists
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            const urlStep = searchParams.get("step");
            if (urlStep && !isNaN(Number(urlStep))) {
                const parsedStep = Number(urlStep);
                if (parsedStep !== step) {
                    updateStep(parsedStep);
                }
            } else {
                // Only reset if there's no step in the URL (first time entry)
                reset();
                // Set initial step in URL
                setSearchParams({ step: "1" }, { replace: true });
            }
        }
    }, [searchParams, step, updateStep, reset, setSearchParams]);

    // When the state `step` changes internally, update the URL (if different)
    useEffect(() => {
        if (hasInitialized.current) {
            const urlStep = searchParams.get("step");
            if (Number(urlStep) !== step) {
                setSearchParams({ step: step.toString() });
            }
        }
    }, [step, searchParams, setSearchParams]);

    // Listen for browser back/forward buttons (URL changes)
    useEffect(() => {
        if (hasInitialized.current) {
            const urlStep = searchParams.get("step");
            if (urlStep && !isNaN(Number(urlStep))) {
                const parsedStep = Number(urlStep);
                if (parsedStep !== step) {
                    updateStep(parsedStep);
                }
            }
        }
    }, [searchParams, step, updateStep]);
};
