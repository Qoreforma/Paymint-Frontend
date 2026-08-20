import React, { useState } from "react";
import { Sparkles, Gift, PlayCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getAvailableSpinTickets,
  AvailableSpinTicket,
} from "@/lib/api/dashboard-apis/rewardsApis";
import { SpinWheelModal } from "./SpinWheelModal";

export const SpinRewardBanner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: tickets = [], isLoading } = useQuery<AvailableSpinTicket[]>({
    queryKey: ["spin-tickets"],
    queryFn: getAvailableSpinTickets,
    staleTime: 30000,
  });

  if (isLoading || !tickets || tickets.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00128F] via-[#1E1B4B] to-[#0A2540] border border-amber-400/40 p-4 sm:p-5 shadow-lg shadow-indigo-950/30 text-white my-5">
        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0 size-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center text-amber-400">
                <Gift className="size-6 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 size-5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {tickets.length}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  You Have {tickets.length} Spin Ticket{tickets.length > 1 ? "s" : ""}!
                </h3>
                <Sparkles className="size-4 text-amber-400 animate-bounce" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Spin the wheel now to claim instant wallet cash or airtime.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/30 transition flex items-center justify-center gap-2 flex-shrink-0"
          >
            <PlayCircle className="size-4 text-slate-950" />
            Spin Now ({tickets.length})
          </button>
        </div>
      </div>

      <SpinWheelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tickets={tickets}
      />
    </>
  );
};
