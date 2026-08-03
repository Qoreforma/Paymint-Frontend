import { cn } from "@/lib/utils";

interface StepProgressProps {
    current: number;
    total?: number;
}

const StepProgress = ({ current, total = 3 }: StepProgressProps) => {
    return (
        <div className="w-full max-w-[360px] mx-auto px-5 mb-8">
            <div className="flex items-center gap-2">
                {Array.from({ length: total }).map((_, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum <= current;
                    
                    return (
                        <div 
                            key={stepNum} 
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                                isActive ? "bg-[var(--aqua)]" : "bg-slate-200"
                            )} 
                        />
                    );
                })}
            </div>
            <div className="text-center mt-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                    Step {current} of {total}
                </span>
            </div>
        </div>
    );
};

export default StepProgress;
