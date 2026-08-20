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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1 pb-1">
                    {plans?.map((plan, i) => {
                        const planId = (plan.id || (plan as any)._id || "").toString();
                        const isSelected = Boolean(selectedPlanId) && Boolean(planId) && (selectedPlanId?.toString() === planId);
                        const rawType = (plan.dataType || plan.attributes?.dataType || "").toString().toUpperCase();
                        const isHot = Boolean(plan.isHot);

                        const getBadgeStyle = (type: string) => {
                            if (type.includes("SME")) return "bg-amber-50 text-amber-700 border-amber-200";
                            if (type.includes("GIFT")) return "bg-purple-50 text-purple-700 border-purple-200";
                            if (type.includes("DIRECT")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
                            if (type.includes("CORP")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
                            return "bg-slate-50 text-slate-700 border-slate-200";
                        };

                        return (
                            <motion.button
                                key={planId || i}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                                onClick={() => onSelect(isSelected ? "" : planId)}
                                className={cn(
                                    "relative flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left group cursor-pointer",
                                    isSelected 
                                        ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/30" 
                                        : isHot
                                        ? "border-amber-200/90 bg-amber-50/10 hover:border-blue-400 hover:shadow-sm"
                                        : "border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-2.5 right-2.5 size-5 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xs">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 mb-2 w-full pr-5">
                                    {isHot && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                                            🔥 HOT
                                        </span>
                                    )}
                                    {rawType && (
                                        <span className={cn(
                                            "inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase border",
                                            getBadgeStyle(rawType)
                                        )}>
                                            {rawType}
                                        </span>
                                    )}
                                </div>
                                
                                <span className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2">
                                    {plan.name}
                                </span>
                                <span className="text-xs text-slate-500 mb-3">
                                    {plan.validity}
                                </span>
                                <span className="mt-auto font-mono text-sm font-bold text-blue-700">
                                    {formatAmount(plan.amount)}
                                </span>
                            </motion.button>
                        );
                    })}
                    {(!plans || plans.length === 0) && (
                        <div className="col-span-full py-8 text-center">
                            <p className="text-sm text-slate-500">No data plans found for the selected filter.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataPlanPicker;
