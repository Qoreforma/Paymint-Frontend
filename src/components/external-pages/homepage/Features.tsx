import { Zap, Shield, Smartphone, Coins } from "lucide-react"

const bentoFeatures = [
  {
    id: 1,
    title: "Lightning Fast Payments",
    description: "Experience 99.9% uptime on all VTU and utility bill payments. Airtime and Data delivered instantly.",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    className: "md:col-span-2 md:row-span-1"
  },
  {
    id: 2,
    title: "Static Virtual Accounts",
    description: "Get your own dedicated account number for instant wallet funding. No more payment delays.",
    icon: Shield,
    color: "text-[#00E5FF]",
    bg: "bg-[#00E5FF]/10",
    className: "md:col-span-1 md:row-span-2"
  },
  {
    id: 3,
    title: "All Networks Covered",
    description: "MTN, Glo, Airtel, 9Mobile. We support all major carriers natively.",
    icon: Smartphone,
    color: "text-[#583EE6]",
    bg: "bg-[#583EE6]/10",
    className: "md:col-span-1 md:row-span-1"
  },
  {
    id: 4,
    title: "Refer & Earn Big",
    description: "Invite your friends and earn juicy commissions on every transaction they make.",
    icon: Coins,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    className: "md:col-span-1 md:row-span-1"
  }
]

const Features = () => {
  return (
    <section className="bg-[#0A0F1E] py-20 md:py-32 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#583EE6] rounded-full mix-blend-screen filter blur-[200px] opacity-10"></div>
        
        <div className="w-[90%] md:w-[80%] mx-auto relative z-10 px-6 sm:px-8">
            <div className="text-center max-w-[800px] mx-auto mb-16 md:mb-24">
                <h2 className="font-bold text-4xl md:text-5xl mb-6 text-white tracking-tight">
                  Powering Your Digital Life
                </h2>
                <p className="text-gray-400 text-lg md:text-xl font-light">
                  A seamless ecosystem designed for speed, security, and absolute convenience.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] max-w-[1100px] mx-auto">
                {
                    bentoFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div 
                                key={feature.id} 
                                className={`group relative rounded-[2rem] p-[1px] bg-gradient-to-b from-white/10 to-white/5 overflow-hidden transition-transform duration-500 hover:-translate-y-2 ${feature.className}`}
                            >
                                <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-xl z-0"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="relative z-10 flex flex-col h-full p-8 md:p-10 justify-between">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.bg} border border-white/5 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        <Icon className={`w-7 h-7 ${feature.color}`} />
                                    </div>
                                    
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-400 leading-relaxed font-light">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    </section>
  )
}

export default Features