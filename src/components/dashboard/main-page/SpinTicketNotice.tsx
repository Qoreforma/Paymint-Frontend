import React, { useState } from "react";
import { motion } from "framer-motion";
import { FerrisWheel, Sparkles, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getAvailableSpinTickets,
  AvailableSpinTicket,
} from "@/lib/api/dashboard-apis/rewardsApis";
import { SpinWheelModal } from "../rewards/SpinWheelModal";

const SpinTicketNotice: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: tickets = [], isLoading } = useQuery<AvailableSpinTicket[]>({
    queryKey: ["spin-tickets"],
    queryFn: getAvailableSpinTickets,
    staleTime: 30000,
  });

  if (isLoading || tickets.length === 0) return null;

  return (
    <>
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="mt-6 w-full relative flex rounded-xl shadow-[0_4px_20px_-4px_rgba(232,185,74,0.3)] border border-[var(--gold)]/40 overflow-hidden cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Main Content (Left) */}
        <div className="flex-1 bg-gradient-to-r from-amber-50 to-white p-5 rounded-l-xl relative overflow-hidden z-10">
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="size-5 text-[var(--gold)] shrink-0" />
              <h2 className="text-slate-800 font-display font-semibold text-lg md:text-xl tracking-tight">
                You have {tickets.length} Spin{tickets.length > 1 ? "s" : ""} Available!
              </h2>
            </div>
            <p className="text-slate-500 text-[13px] md:text-sm leading-relaxed mb-4">
              Tap here to spin the wheel and claim your referral rewards.
            </p>
            
            <button className="text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-[var(--gold)] to-amber-500 w-max px-6 py-2.5 rounded hover:opacity-90 transition-opacity shadow-sm tracking-wide flex items-center gap-2">
              <FerrisWheel className="size-4" />
              SPIN NOW
            </button>
          </div>
        </div>

        {/* Ticket Stub (Right) */}
        <div className="hidden sm:flex w-[120px] bg-gradient-to-br from-amber-400 to-[var(--gold)] rounded-r-xl perforated-left flex-col items-center justify-center p-4 text-center z-0 relative">
           <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
           <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white/20 p-2.5 rounded-full mb-2 backdrop-blur-sm shadow-inner border border-white/30">
               <Gift className="size-6 text-white drop-shadow-md" strokeWidth={1.5} />
             </div>
             <div className="text-white font-bold text-xs font-mono uppercase tracking-widest opacity-90">
               Reward
             </div>
           </div>
        </div>
      </motion.section>

      <SpinWheelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tickets={tickets}
      />
    </>
  );
};

export default SpinTicketNotice;