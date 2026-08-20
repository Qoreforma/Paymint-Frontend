import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Sparkles, Trophy, Gift, ArrowRight, Loader2 } from "lucide-react";
import {
  AvailableSpinTicket,
  ClaimSpinResponse,
  claimSpin,
} from "@/lib/api/dashboard-apis/rewardsApis";
import { SpinWheelCanvas } from "./SpinWheelCanvas";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: AvailableSpinTicket[];
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  tickets,
}) => {
  const queryClient = useQueryClient();
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [spinOutcome, setSpinOutcome] = useState<ClaimSpinResponse | null>(null);
  const [showWinnerCard, setShowWinnerCard] = useState<boolean>(false);
  const [recipientPhone, setRecipientPhone] = useState<string>("");

  const activeTicket = tickets[selectedTicketIndex] || tickets[0];
  const wheelConfig = activeTicket?.wheelConfig;
  const segments = wheelConfig?.segments || [];

  const handleStartSpin = async () => {
    if (!activeTicket || isSpinning) return;

    setIsSpinning(true);
    setShowWinnerCard(false);
    setSpinOutcome(null);

    try {
      // Execute 3-step atomic claim on backend
      const response = await claimSpin(
        activeTicket._id,
        recipientPhone.trim() || undefined
      );

      setSpinOutcome(response);
      setTargetIndex(response.winningSegmentIndex);
    } catch (error: any) {
      setIsSpinning(false);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to claim spin. Please try again.";
      toast.error(msg);
    }
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setShowWinnerCard(true);

    // Refresh tickets, history, and wallet
    queryClient.invalidateQueries({ queryKey: ["spin-tickets"] });
    queryClient.invalidateQueries({ queryKey: ["spin-history"] });
    queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
  };

  const handleResetForNextSpin = () => {
    setShowWinnerCard(false);
    setSpinOutcome(null);
    setTargetIndex(null);
    setSelectedTicketIndex(0);
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !isSpinning && !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border border-amber-500/30 rounded-2xl p-6 shadow-2xl z-50 text-white animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Gift className="size-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-white flex items-center gap-1.5">
                  Spin & Win Rewards
                  <Sparkles className="size-4 text-amber-400 animate-pulse" />
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-400">
                  {tickets.length} spin ticket{tickets.length > 1 ? "s" : ""} available
                </Dialog.Description>
              </div>
            </div>

            {!isSpinning && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          {/* Ticket selector if multiple available */}
          {tickets.length > 1 && !showWinnerCard && !isSpinning && (
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 my-1">
              {tickets.map((t, idx) => (
                <button
                  key={t._id}
                  onClick={() => {
                    setSelectedTicketIndex(idx);
                    setTargetIndex(null);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition whitespace-nowrap ${
                    selectedTicketIndex === idx
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Ticket #{idx + 1} ({t.tierId?.name || "Standard"})
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="py-4 flex flex-col items-center">
            {showWinnerCard && spinOutcome ? (
              /* Winner Reveal Card */
              <div className="w-full text-center py-6 px-4 bg-gradient-to-b from-amber-500/10 via-slate-800/80 to-amber-500/10 rounded-xl border border-amber-500/40 shadow-inner animate-in zoom-in duration-300">
                <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-3 shadow-lg shadow-amber-500/30">
                  <Trophy className="size-10 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Congratulations! 🎉
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  You won{" "}
                  <span className="font-extrabold text-amber-400 text-base">
                    {spinOutcome.wonSegment.label}
                  </span>
                </p>

                <div className="bg-slate-900/90 py-3 px-4 rounded-lg border border-slate-700/60 max-w-[280px] mx-auto mb-6">
                  <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
                    Reward Value
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    ₦{spinOutcome.result.rewardValue.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 block capitalize mt-0.5">
                    {spinOutcome.result.rewardType === "balance"
                      ? "Direct Wallet Credit"
                      : "Airtime Recharge"}
                  </span>
                </div>

                <div className="flex gap-2">
                  {tickets.length > 1 ? (
                    <button
                      onClick={handleResetForNextSpin}
                      className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5"
                    >
                      Spin Next Ticket
                      <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/25"
                    >
                      Awesome, Done!
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Interactive Wheel Display */
              <div className="flex flex-col items-center w-full">
                {segments.length > 0 ? (
                  <SpinWheelCanvas
                    segments={segments}
                    isSpinning={isSpinning}
                    targetIndex={targetIndex}
                    onSpinComplete={handleSpinComplete}
                  />
                ) : (
                  <div className="py-16 text-center text-slate-400 text-sm">
                    No active wheel segments found for this tier.
                  </div>
                )}

                {/* Airtime Choice Mode Phone Prompt (if applicable) */}
                {wheelConfig?.airtimeRecipientMode === "user-choice" &&
                  !isSpinning && (
                    <div className="w-full mt-3 px-2">
                      <label className="text-xs text-slate-300 block mb-1 text-left">
                        Recipient Phone (optional — defaults to profile phone):
                      </label>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="e.g. 08012345678"
                        className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                {/* Spin CTA Button */}
                <div className="w-full mt-5">
                  <button
                    onClick={handleStartSpin}
                    disabled={isSpinning || segments.length === 0}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-xl ${
                      isSpinning || segments.length === 0
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/30 active:scale-[0.98]"
                    }`}
                  >
                    {isSpinning ? (
                      <>
                        <Loader2 className="size-5 animate-spin text-slate-900" />
                        Spinning...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        SPIN THE WHEEL
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
