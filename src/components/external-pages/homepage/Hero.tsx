import Mobile_app_store_Apple from "../../../assets/main-pages/Mobile app store badge Apple.png" 
import Mobile_app_store_Google from "../../../assets/main-pages/Mobile app store badge Google.png" 
import Hero_Image from "../../../assets/main-pages/futuristic_fintech_hero.png"
import Partnerships from "./Partnerships"

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#0A0F1E]">
        {/* Animated Glow Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#583EE6] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#00E5FF] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        
        <div className="max-sm:w-[90%] max-sm:mx-auto md:w-[80%] mx-auto pt-20 md:pt-36 pb-20 text-center relative z-10">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] to-[#583EE6] blur-md opacity-30 rounded-full"></div>
              <p className="relative bg-[#0A0F1E]/80 backdrop-blur-md border border-white/10 rounded-full py-2 px-5 text-white/90 font-medium text-sm w-fit mx-auto shadow-xl">
                  🚀 Welcome to the Future of Payments
              </p>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-[#00E5FF] mt-8 max-w-[800px] mx-auto max-sm:px-8 leading-tight tracking-tight">
              The Ultimate Financial Super App
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl mt-6 max-w-[600px] mx-auto max-sm:px-8 font-light leading-relaxed">
              Experience lightning-fast VTU, seamless bill payments, and smart virtual accounts—all wrapped in a stunning, secure ecosystem.
            </p>
            
            <div className="flex items-center gap-4 md:gap-6 w-full justify-center mt-12 md:mt-16">
              <button className="cursor-pointer hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(88,62,230,0.4)] rounded-xl">
                <img className="w-[140px] h-auto md:w-[200px]" src={Mobile_app_store_Apple} alt="Download on App Store" />
              </button>
              <button className="cursor-pointer hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] rounded-xl">
                <img className="w-[140px] h-auto md:w-[200px]" src={Mobile_app_store_Google} alt="Get it on Google Play" />
              </button>
            </div>

            <div className="mt-20 md:mt-28 relative max-w-[1100px] mx-auto px-4 sm:px-8">
                 {/* Glassmorphism Device Frame Effect */}
                <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-white/20 to-transparent shadow-[0_0_50px_rgba(0,229,255,0.15)]">
                  <div className="rounded-[2rem] overflow-hidden bg-[#0A0F1E]/50 backdrop-blur-xl border border-white/5 relative">
                     <img 
                        className="object-cover w-full h-auto mx-auto transform hover:scale-[1.02] transition-transform duration-700" 
                        src={Hero_Image} 
                        alt="PayMint Futuristic Interface" 
                      />
                      {/* Reflection highlight */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>
            </div>
            
            <div className="mt-24 border-t border-white/5 pt-10">
              <p className="text-gray-500 uppercase tracking-widest text-sm mb-8 font-medium">Trusted by innovative companies</p>
              <div className="filter invert opacity-50 hover:opacity-100 transition-opacity duration-500">
                <Partnerships />
              </div>
            </div>
        </div>
    </section>
  )
}

export default Hero