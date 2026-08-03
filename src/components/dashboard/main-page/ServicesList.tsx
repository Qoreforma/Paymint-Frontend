import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { fetchAirtimeProviders, fetchDataProviders, fetchElectricityProviders, fetchBettingProviders } from "@/lib/api/dashboard-apis/servicesApis"
import { appServices } from "@/lib/constants";

const ServicesList = ({ onOpenAllServices }: { onOpenAllServices: () => void }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Silently pre-fetch most commonly used providers for instant loading
    queryClient.prefetchQuery({ queryKey: ["airtime-providers"], queryFn: fetchAirtimeProviders });
    queryClient.prefetchQuery({ queryKey: ["data-providers"], queryFn: fetchDataProviders });
    queryClient.prefetchQuery({ queryKey: ["electricity-providers"], queryFn: fetchElectricityProviders });
    queryClient.prefetchQuery({ queryKey: ["betting-providers"], queryFn: fetchBettingProviders });
  }, [queryClient]);

  const featuredServices = appServices.filter(s => (s as any).featured);

  return (
    <section className="mt-8 bg-transparent rounded-xl">
        <div className="flex justify-between items-center px-2 md:px-0">
          <h2 className="text-slate-800 font-display text-base md:text-lg font-semibold">Services</h2>
          <button onClick={onOpenAllServices} className="text-blue-600 text-sm font-medium hover:underline">
            See all
          </button>
        </div>
        <div className="flex md:grid overflow-x-auto md:grid-cols-4 gap-4 mt-4 py-2 px-2 md:px-0 pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {
              featuredServices.map(({id, label, icon: Icon, href, ...rest}, i) => {
                  const service = rest as any;
                  return (
                  <motion.div 
                    initial={{opacity: 0, y: 15}}
                    whileInView={{opacity: 100, y: 0}}
                    whileHover={{y: -4, scale: 1.02}}
                    transition={{delay: i*0.05, duration: .3 }}
                    viewport={{once: true}}
                    key={id} 
                    className="flex flex-col group cursor-pointer min-w-[150px] md:min-w-0 md:w-full snap-start"
                  >
                      <Link 
                        to={href} 
                        className={`relative overflow-hidden flex flex-col items-center justify-center p-5 border ${service.borderColor || 'border-slate-200'} ${service.bgColor || 'bg-white'} rounded-2xl transition-all duration-300 hover:shadow-md h-[160px]`}
                      >
                          <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 border ${service.borderColor || 'border-slate-100'}`}>
                             <img src={Icon as string} alt={label} className={`size-6 ${service.iconColor || ''}`} />
                          </div>
                          <p className="text-slate-800 font-display text-sm font-semibold tracking-tight text-center">{label}</p>
                          <p className="text-slate-500 text-[11px] text-center leading-tight mt-1 px-1">
                            {service.subtitle}
                          </p>
                      </Link>
                  </motion.div>
              )})
            }
        </div>
    </section>
  )
}

export default ServicesList