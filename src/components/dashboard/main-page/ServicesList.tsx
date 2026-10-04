import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchAirtimeProviders, fetchDataProviders, fetchElectricityProviders, fetchBettingProviders, fetchSmmPlatforms } from "@/lib/api/dashboard-apis/servicesApis"
import { getServicesStatus, ServicesData } from "@/lib/api/dashboard-apis/generics"
import { appServices } from "@/lib/constants";
import { toast } from "sonner";

const ServicesList = ({ onOpenAllServices }: { onOpenAllServices: () => void }) => {
  const queryClient = useQueryClient();

  const { data: servicesStatus } = useQuery<ServicesData, Error>({
    queryKey: ["servicesStatus"],
    queryFn: getServicesStatus,
  });

  useEffect(() => {
    // Silently pre-fetch most commonly used providers for instant loading
    queryClient.prefetchQuery({ queryKey: ["airtime-providers"], queryFn: fetchAirtimeProviders });
    queryClient.prefetchQuery({ queryKey: ["data-providers"], queryFn: fetchDataProviders });
    queryClient.prefetchQuery({ queryKey: ["electricity-providers"], queryFn: fetchElectricityProviders });
    queryClient.prefetchQuery({ queryKey: ["betting-providers"], queryFn: fetchBettingProviders });
    queryClient.prefetchQuery({ queryKey: ["smm-platforms"], queryFn: fetchSmmPlatforms });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getServiceStatusInfo = (serviceCode?: string) => {
    if (!serviceCode || !servicesStatus) return null;
    return servicesStatus[serviceCode] || (serviceCode === "cable_tv" ? servicesStatus.cable : undefined);
  };

  const featuredServices = appServices.filter(s => (s as any).featured);

  return (
    <section className="mt-8 bg-transparent rounded-xl">
        <div className="flex justify-between items-center px-1 md:px-0">
          <h2 className="text-slate-800 font-display text-base md:text-lg font-semibold">Explore PayMint</h2>
          <button onClick={onOpenAllServices} className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">
            See all
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 mt-4 py-2 px-1 pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {
              featuredServices.map(({id, label, icon: Icon, href, ...rest}, i) => {
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
                    }
                  };

                  return (
                  <motion.div 
                    initial={{opacity: 0, y: 15}}
                    whileInView={{opacity: 100, y: 0}}
                    whileHover={isInactive ? {} : {y: -3, scale: 1.01}}
                    transition={{delay: i*0.04, duration: .3 }}
                    viewport={{once: true}}
                    key={id} 
                    className="flex flex-col group cursor-pointer min-w-[170px] sm:min-w-[185px] md:min-w-[200px] shrink-0 snap-start"
                  >
                      <Link 
                        to={href} 
                        onClick={handleServiceClick}
                        className={`relative overflow-hidden flex flex-col items-start justify-between p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl transition-all duration-300 h-[155px] w-full ${
                          isInactive 
                            ? 'opacity-75 hover:border-slate-300' 
                            : 'hover:shadow-md hover:border-blue-200'
                        }`}
                      >
                          <div className="w-full flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                               <img src={Icon as string} alt={label} className="size-6 object-contain" />
                            </div>
                            {isComingSoon && (
                              <span className="text-[10px] font-semibold tracking-tight px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                Coming Soon
                              </span>
                            )}
                            {isTemporaryDeactivated && (
                              <span className="text-[10px] font-semibold tracking-tight px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                Maintenance
                              </span>
                            )}
                            {isDeactivated && (
                              <span className="text-[10px] font-semibold tracking-tight px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <div className="w-full text-left mt-3">
                            <p className="text-slate-800 font-display text-sm font-semibold tracking-tight text-left truncate">{label}</p>
                            <p className="text-slate-500 text-xs text-left leading-tight mt-1">
                              {service.subtitle}
                            </p>
                          </div>
                      </Link>
                  </motion.div>
              )})
            }
        </div>
    </section>
  )
}

export default ServicesList