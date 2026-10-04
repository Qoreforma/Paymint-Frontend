import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import { appServices } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics";
import { toast } from "sonner";

interface AllServicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllServicesModal = ({ open, onOpenChange }: AllServicesModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: servicesStatus } = useQuery<ServicesData, Error>({
    queryKey: ["servicesStatus"],
    queryFn: getServicesStatus,
  });

  const getServiceStatusInfo = (serviceCode?: string) => {
    if (!serviceCode || !servicesStatus) return null;
    return servicesStatus[serviceCode] || (serviceCode === "cable_tv" ? servicesStatus.cable : undefined);
  };

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (open) {
      // Small timeout ensures the dialog is fully mounted and animation started
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Clear search when closed
      setSearchQuery("");
    }
  }, [open]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return appServices;
    
    const query = searchQuery.toLowerCase();
    return appServices.filter(service => 
      service.label.toLowerCase().includes(query) || 
      (service as any).subtitle?.toLowerCase().includes(query) ||
      (service as any).category?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group services by category
  const groupedServices = useMemo(() => {
    const groups = filteredServices.reduce((acc, service) => {
      const category = (service as any).category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, typeof appServices>);
    
    // Sort groups so Telecom is first, etc. (optional, just relies on insertion order for now)
    return groups;
  }, [filteredServices]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-[#F9FAFB]">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-4 md:p-6 pb-4">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-display font-semibold text-slate-800">
              All Services
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              ref={inputRef}
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 w-full bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 rounded-xl h-11 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 md:p-6 pt-2">
          {Object.keys(groupedServices).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <Search className="size-8 text-slate-300 mb-2" />
              <p>No services found matching "{searchQuery}"</p>
            </div>
          ) : (
            <AnimatePresence>
              {Object.entries(groupedServices).map(([category, services]) => (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 last:mb-2"
                >
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {services.map(({id, label, icon: Icon, href, ...rest}) => {
                      const service = rest as any;
                      const statusInfo = getServiceStatusInfo(service.serviceCode);
                      const isDeactivated = statusInfo?.status === "deactivated";
                      const isTemporaryDeactivated = statusInfo?.status === "temporary-deactivated";
                      const isComingSoon = statusInfo?.status === "coming-soon";
                      const isInactive = isDeactivated || isTemporaryDeactivated || isComingSoon;

                      const handleServiceClick = (e: React.MouseEvent) => {
                        if (isInactive) {
                          e.preventDefault();
                          toast.info(statusInfo?.message || `${label} is currently unavailable.`);
                          return;
                        }
                        onOpenChange(false);
                      };

                      return (
                      <Link 
                        key={id}
                        to={href} 
                        onClick={handleServiceClick}
                        className={`group relative overflow-hidden flex flex-col items-center justify-center p-3 border ${service.borderColor || 'border-slate-200'} ${service.bgColor || 'bg-white'} rounded-xl transition-all duration-300 text-center h-[135px] ${
                          isInactive 
                            ? 'opacity-75 hover:border-slate-300 cursor-pointer' 
                            : 'hover:shadow-md hover:-translate-y-1'
                        }`}
                      >
                          {isComingSoon && (
                            <span className="absolute top-2 right-2 text-[9px] font-semibold tracking-tight px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Soon
                            </span>
                          )}
                          {isTemporaryDeactivated && (
                            <span className="absolute top-2 right-2 text-[9px] font-semibold tracking-tight px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                              Maint.
                            </span>
                          )}
                          {isDeactivated && (
                            <span className="absolute top-2 right-2 text-[9px] font-semibold tracking-tight px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              Inactive
                            </span>
                          )}
                          <div className={`w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 border ${service.borderColor || 'border-slate-100'}`}>
                              <img src={Icon as string} alt={label} className={`size-5 object-contain`} />
                          </div>
                          <p className="text-slate-800 font-display text-[12px] font-semibold tracking-tight leading-tight line-clamp-1">{label}</p>
                          {service.subtitle && (
                            <p className="text-slate-500 text-[10px] leading-tight mt-1 px-1 line-clamp-2">
                              {service.subtitle}
                            </p>
                          )}
                      </Link>
                    )})}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllServicesModal;
