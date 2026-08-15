import React from "react";
import { cn, formatAmount } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { IDataPlan } from "@/lib/api/dashboard-apis/servicesApis";

interface DataPlanPickerProps {
    plans?: IDataPlan[];
    isLoading: boolean;
    error: any;
    selectedPlanId: string | null;
    onSelect: (planId: string) => void;
}

const DataPlanPicker: React.FC<DataPlanPickerProps> = ({
    plans,
    isLoading,
    error,
    selectedPlanId,
    onSelect,
}) => {
    return (
        <div className="w-full">
            <label className="text-sm text-[#344054] font-medium block mb-2">Data Plan</label>
            
            {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                    <Loader2 className="animate-spin size-4" /> Fetching plans...
                </div>
            )}
            
            {error && (
                <p className="text-red-500 text-sm py-2">Failed to load data plans. Please try again.</p>
            )}

            {!isLoading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1 pb-1">
                    {plans?.map((plan, i) => {
                        const planId = (plan.id || (plan as any)._id || "").toString();
                        const isSelected = Boolean(selectedPlanId) && Boolean(planId) && (selectedPlanId?.toString() === planId);
                        const isSme = plan.dataType === "SME";

                        return (
                            <motion.button
                                key={planId || i}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                                onClick={() => onSelect(isSelected ? "" : planId)}
                                className={cn(
                                    "relative flex flex-col items-start p-3 rounded-xl border transition-all text-left group",
                                    isSelected 
                                        ? "border-[var(--brand-ink)] shadow-sm bg-[var(--brand-ink)]/5" 
                                        : "border-slate-200 bg-white hover:border-[var(--brand-ink)]/50 hover:shadow-sm"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <Check className="size-4 text-[var(--brand-ink)]" />
                                    </div>
                                )}
                                
                                {isSme && (
                                    <div className="mb-2">
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-amber-100 text-amber-700">
                                            SME
                                        </span>
                                    </div>
                                )}
                                
                                <span className={cn("font-semibold text-slate-800 text-sm pr-4 line-clamp-2", isSme ? "mb-1" : "mb-1")}>
                                    {plan.name}
                                </span>
                                <span className="text-xs text-slate-500 mb-2">
                                    {plan.validity}
                                </span>
                                <span className="mt-auto font-mono text-sm font-semibold text-[var(--brand-ink)]">
                                    {formatAmount(plan.amount)}
                                </span>
                            </motion.button>
                        );
                    })}
                    {(!plans || plans.length === 0) && (
                        <p className="col-span-full text-sm text-gray-500 py-2">No plans found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataPlanPicker;
