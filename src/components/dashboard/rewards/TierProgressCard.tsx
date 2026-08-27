import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getUserTierProgress,
  TierProgressResponse,
  QualificationRuleType,
} from "@/lib/api/dashboard-apis/rewardsApis";
import { Target, Users, Clock, TrendingUp } from "lucide-react";

const pendingLabel: Record<QualificationRuleType, string> = {
  "all-time-count": "",
  "new-since-last-claim": "",
  "referee-profile-complete": "awaiting profile",
  "referee-min-transaction-value": "below trade min",
  "referee-setup-account": "unverified",
};

const TierProgressCard: React.FC = () => {
  const { data: progressData, isLoading } = useQuery<TierProgressResponse | null>({
    queryKey: ["tier-progress"],
    queryFn: getUserTierProgress,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#EAECF0] bg-white p-4 animate-pulse my-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-2.5 bg-gray-200 rounded-full w-full mb-4" />
        <div className="flex gap-3">
          <div className="h-14 bg-gray-200 rounded-xl flex-1" />
          <div className="h-14 bg-gray-200 rounded-xl flex-1" />
          <div className="h-14 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    );
  }

  if (!progressData) return null;

  const { currentTier, progress } = progressData;
  const {
    totalReferrals,
    qualifyingReferrals,
    pendingReferrals,
    countedReferrals,
    referralsToNextSpin,
    totalSpinsEarned,
  } = progress;

  const { referralThreshold, tierName, qualificationRule } = currentTier;
  const ruleType = qualificationRule.type;

  // Progress within the current spin cycle (uncounted qualifying referrals)
  const uncounted = Math.max(0, qualifyingReferrals - countedReferrals);
  const barProgress = Math.min(100, (uncounted / referralThreshold) * 100);

  const showPending =
    pendingReferrals > 0 &&
    ruleType !== "all-time-count" &&
    ruleType !== "new-since-last-claim";

  const isNewSinceClaim = ruleType === "new-since-last-claim";

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-4 shadow-sm my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-[#2A52BE]" />
          <h3 className="text-sm font-semibold text-[#344054]">{tierName}</h3>
        </div>
        {totalSpinsEarned > 0 && (
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {totalSpinsEarned} spin{totalSpinsEarned > 1 ? "s" : ""} earned
          </span>
        )}
      </div>

      {/* Sub-text */}
      <p className="text-xs text-[#667085] mb-3">
        {isNewSinceClaim
          ? `${qualifyingReferrals} new referral${qualifyingReferrals !== 1 ? "s" : ""} since last spin · ${referralsToNextSpin} more needed`
          : referralsToNextSpin === 0
          ? "🎉 You've qualified for a new spin!"
          : `${uncounted} of ${referralThreshold} referrals · ${referralsToNextSpin} more to unlock spin`}
      </p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#F2F4F7] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-[#2A52BE] to-[#6B8EF0] rounded-full transition-all duration-700"
          style={{ width: `${barProgress}%` }}
        />
      </div>

      {/* Stats chips */}
      <div className="flex gap-2">
        <StatChip
          icon={<Users className="size-3.5 text-[#667085]" />}
          label="Total referred"
          value={totalReferrals}
        />
        <StatChip
          icon={<TrendingUp className="size-3.5 text-emerald-500" />}
          label="Qualifying"
          value={qualifyingReferrals}
          highlight
        />
        {showPending && (
          <StatChip
            icon={<Clock className="size-3.5 text-amber-500" />}
            label={pendingLabel[ruleType] || "Pending"}
            value={pendingReferrals}
          />
        )}
      </div>

      {/* Trade minimum note */}
      {ruleType === "referee-min-transaction-value" &&
        qualificationRule.minTransactionValue && (
          <p className="text-[11px] text-[#667085] mt-2.5 text-center">
            Friends must trade at least{" "}
            <span className="font-semibold text-[#344054]">
              ₦{qualificationRule.minTransactionValue.toLocaleString()}
            </span>{" "}
            to qualify
          </p>
        )}
    </div>
  );
};

const StatChip: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div
    className={`flex-1 rounded-xl px-2.5 py-2.5 flex flex-col items-center text-center ${
      highlight ? "bg-[#EEF2FF]" : "bg-[#F9FAFB]"
    }`}
  >
    <div className="flex items-center gap-1 mb-0.5">
      {icon}
      <span
        className={`text-base font-bold leading-none ${
          highlight ? "text-[#2A52BE]" : "text-[#344054]"
        }`}
      >
        {value}
      </span>
    </div>
    <span className="text-[10px] text-[#667085] leading-tight">{label}</span>
  </div>
);

export default TierProgressCard;
