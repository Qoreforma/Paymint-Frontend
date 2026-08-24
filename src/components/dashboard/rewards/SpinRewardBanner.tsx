import React, { useState } from "react";
import { FerrisWheel } from "lucide-react";
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

  if ((isLoading || !tickets || tickets.length === 0) && !isModalOpen) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2A52BE] to-[#3B66D6] p-4 shadow-sm text-white my-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full">
          {/* Icon Container */}
          <div className="flex-shrink-0 size-12 rounded-full bg-white/10 flex items-center justify-center">
            <FerrisWheel className="size-6 text-red-400" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1">
              🔥 Spin & Win is Live!
            </h3>
            <p className="text-xs sm:text-sm text-white/80">
              You have {tickets.length === 1 ? "a spin" : `${tickets.length} spins`} available
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-auto px-5 py-2 bg-white hover:bg-white/90 active:scale-95 text-[#2A52BE] font-bold text-xs sm:text-sm rounded-full shadow-sm transition whitespace-nowrap"
        >
          Spin Now
        </button>
      </div>

      <SpinWheelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tickets={tickets}
      />
    </>
  );
};
