import React from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export type Provider = {
    id: string;
    name: string;
    code: string;
    logo: string;
    status?: "active" | "coming-soon" | "deactivated" | "temporary-deactivated";
    statusMessage?: string | null;
};

interface NetworkProviderPickerProps {
    providers?: Provider[];
    isLoading: boolean;
    selectedProviderCode: string | null;
    onSelect: (providerCode: string, providerId: string) => void;
    label?: string;
}

const NetworkProviderPicker: React.FC<NetworkProviderPickerProps> = ({
    providers,
    isLoading,
    selectedProviderCode,
    onSelect,
    label = "Network provider"
}) => {
    return (
        <div className="w-full">
            <label className="text-sm text-[#344054] font-medium block mb-2">{label}</label>
            
            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                    <Loader2 className="animate-spin size-4" /> Loading providers...
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    {providers?.map((prov, i) => {
                        const isSelected = selectedProviderCode === prov.code;
                        const isUnavailable = prov.status && prov.status !== "active";
                        return (
                            <motion.button
                                key={prov.id}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => {
                                    if (isUnavailable) {
                                        toast.info(prov.statusMessage || `${prov.name} is temporarily unavailable.`);
                                        return;
                                    }
                                    onSelect(isSelected ? "" : prov.code, isSelected ? "" : prov.id);
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all h-[100px] md:h-[110px]",
                                    isUnavailable
                                        ? "border-amber-200 bg-amber-50/40 opacity-75 hover:border-amber-300"
                                        : isSelected
                                        ? "border-blue-600 bg-blue-50/30"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                )}
                            >
                                {isSelected && !isUnavailable && (
                                    <div className="absolute -top-2 -right-2 size-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                        <Check className="size-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                {isUnavailable && (
                                    <div className="absolute top-1.5 right-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                                        {prov.status === "coming-soon" ? "Soon" : "Down"}
                                    </div>
                                )}
                                <div className="mb-2">
                                    <img src={prov.logo} className="size-10 object-contain" alt={prov.name} />
                                </div>
                                <span className="text-sm font-semibold text-slate-800 text-center capitalize tracking-tight w-full truncate px-1">
                                    {prov.name.replace(/airtime/i, "").trim()}
                                </span>
                            </motion.button>
                        );
                    })}
                    {(!providers || providers.length === 0) && !isLoading && (
                        <p className="col-span-4 text-sm text-gray-500 py-2">No providers found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NetworkProviderPicker;

