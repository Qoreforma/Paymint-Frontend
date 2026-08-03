import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AvatarGroup from "@/assets/dashboard/Avatar Groups.png";

const InviteAndEarnBanner = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 md:mt-8 mb-4 w-full relative flex rounded-xl shadow-sm border border-slate-200"
    >
      {/* Main Ticket */}
      <div className="flex-1 bg-white p-5 md:p-6 rounded-l-xl md:rounded-r-none rounded-r-xl relative overflow-hidden z-10">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--brand)]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10">
          <h2 className="text-slate-800 font-display font-semibold text-lg md:text-xl tracking-tight">Invite your friends and earn!</h2>
          <p className="text-slate-500 text-[13px] md:text-sm leading-relaxed mb-1 md:pr-4">
            Get rewarded for every friend who signs up and makes a transaction using your referral link.
          </p>
          <Link 
            to="/dashboard/affiliate" 
            className="mt-2 text-xs md:text-sm font-semibold text-white bg-[var(--brand-ink)] w-max px-5 py-2.5 rounded hover:bg-slate-800 transition-colors shadow-sm tracking-wide"
          >
            START EARNING
          </Link>
        </div>
      </div>

      {/* Raffle Stub */}
      <div className="hidden md:flex w-1/3 bg-[#FDF9ED] rounded-r-xl perforated-left flex-col items-center justify-center p-6 text-center z-0 relative">
        <div className="text-[var(--gold)] font-bold text-lg mb-2 font-mono uppercase tracking-widest opacity-80 border-b border-[var(--gold)]/30 pb-1">Reward</div>
        <img src={AvatarGroup} alt="Invite friends" className="w-20 h-auto object-contain drop-shadow-sm mt-1" />
      </div>
    </motion.section>
  )
}

export default InviteAndEarnBanner;
