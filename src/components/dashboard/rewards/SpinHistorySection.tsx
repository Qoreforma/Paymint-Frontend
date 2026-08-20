import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getSpinHistory,
  SpinResultItem,
} from "@/lib/api/dashboard-apis/rewardsApis";
import { Trophy, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const SpinHistorySection: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["spin-history"],
    queryFn: () => getSpinHistory(1, 10),
  });

  const historyItems: SpinResultItem[] = data?.data || [];

  if (isLoading || historyItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#344054] font-medium text-base sm:text-lg flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          Spin & Win Rewards History
        </h3>
        <span className="text-xs text-[#667085]">
          {historyItems.length} reward{historyItems.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {historyItems.map((item) => {
          const dateStr = item.resolvedAt
            ? new Date(item.resolvedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recent";

          return (
            <div
              key={item._id}
              className="flex items-center justify-between bg-white rounded-xl py-3 px-4 border border-[#EAECF0] shadow-sm hover:shadow transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0"
                  style={{
                    backgroundColor: item.wonSegment?.displayColor || "#6366F1",
                  }}
                >
                  ₦
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C1C1C]">
                    {item.wonSegment?.label || `₦${item.rewardValue}`}
                  </p>
                  <p className="text-xs text-[#667085]">
                    {item.tierId?.name || "Referral Milestone"} · {dateStr}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-sm font-bold text-emerald-600">
                  +₦{item.rewardValue.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium mt-0.5 capitalize">
                  {item.payoutStatus === "success" ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="size-3" />
                      Paid
                    </span>
                  ) : item.payoutStatus === "failed" ? (
                    <span className="text-rose-500 flex items-center gap-0.5">
                      <AlertCircle className="size-3" />
                      Processing
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-0.5">
                      <Clock className="size-3" />
                      Pending
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
