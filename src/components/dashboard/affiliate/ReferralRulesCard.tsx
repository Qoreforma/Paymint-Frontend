import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getReferralTerms, ReferralTerm } from "@/lib/api/dashboard-apis/referralsApis";
import { User } from "@/context/AuthContext";
import { formatAmount } from "@/lib/utils";
import { Award, CheckCircle2, Gift, Sparkles, HelpCircle, ShieldCheck } from "lucide-react";
import DOMPurify from "dompurify";

interface ReferralRulesCardProps {
  user: User | null;
}

export const ReferralRulesCard: React.FC<ReferralRulesCardProps> = ({ user }) => {
  const isInfluencer =
    user?.userType === "influencer" ||
    user?.userType === "micro-influencer" ||
    Boolean(user?.influencerRules);

  const { data: terms, isLoading: loadingTerms } = useQuery<ReferralTerm[]>({
    queryKey: ["referral-terms"],
    queryFn: getReferralTerms,
    staleTime: 1000 * 60 * 10,
    enabled: !isInfluencer,
  });

  if (isInfluencer) {
    const rules = user?.influencerRules;
    const activeRules = [];

    if (rules?.accountCompletion?.isActive) {
      activeRules.push({
        title: "Account Completion",
        desc: "Earned when your referee signs up and completes basic profile setup.",
        reward: formatAmount(rules.accountCompletion.rewardAmount),
      });
    }

    if (rules?.firstBillPayment?.isActive) {
      activeRules.push({
        title: "First Bill Payment",
        desc: "Earned on your referee's first successful airtime, data, or utility payment.",
        reward: formatAmount(rules.firstBillPayment.rewardAmount),
      });
    }

    if (rules?.kycCompletion?.isActive) {
      activeRules.push({
        title: "KYC Verification",
        desc: "Earned when your referee verifies their identity (BVN / Tier 1 KYC).",
        reward: formatAmount(rules.kycCompletion.rewardAmount),
      });
    }

    if (rules?.transactionVolume?.isActive) {
      activeRules.push({
        title: "Trading Volume Target",
        desc: `Earned when referee reaches ${formatAmount(rules.transactionVolume.targetVolume)} in total transactions.`,
        reward: formatAmount(rules.transactionVolume.rewardAmount),
      });
    }

    if (rules?.refereeFirstTransaction?.isActive) {
      activeRules.push({
        title: "Referee First Trade Discount",
        desc: `Your referees get ${rules.refereeFirstTransaction.discountPercentage || 10}% off (up to ${formatAmount(rules.refereeFirstTransaction.cap || 200)}) on their first trade!`,
        reward: "Special Offer",
      });
    }

    return (
      <div className="bg-gradient-to-br from-[#0B2253] via-[#00128F] to-[#0A1B3B] text-white rounded-2xl p-5 md:p-6 shadow-lg border border-blue-400/20 my-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
              <Award className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Influencer Commission Rules</h3>
              <p className="text-blue-200 text-xs">
                Your custom partner rates and automated reward triggers
              </p>
            </div>
          </div>
          <span className="bg-amber-400/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/30">
            {(user?.userType || "influencer").toUpperCase()} PARTNER
          </span>
        </div>

        {activeRules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {activeRules.map((r, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-white flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-300 shrink-0" />
                      {r.title}
                    </span>
                    <span className="text-amber-300 font-bold text-sm shrink-0">
                      {r.reward}
                    </span>
                  </div>
                  <p className="text-blue-100/80 text-xs mt-1.5 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-200 text-sm mt-3 bg-white/5 p-4 rounded-xl border border-white/10">
            Your custom influencer commission rules are active and will track automatically for all your referee activities.
          </p>
        )}
      </div>
    );
  }

  // Regular user view
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-[#EAECF0] my-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Gift className="size-5" />
        </div>
        <div>
          <h3 className="font-semibold text-base md:text-lg text-[#101828]">
            Referral Program &amp; Bonus Structure
          </h3>
          <p className="text-[#667085] text-xs">
            How you earn rewards when you invite friends and family to Paymint
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs text-[#344054]">
            <span className="font-semibold">Instant Milestone Bonuses:</span> Earn milestone cash rewards credited directly to your Paymint wallet when your referrals complete trade transactions and bill payments.
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <ShieldCheck className="size-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-[#344054]">
            <span className="font-semibold">Spin &amp; Win Rewards:</span> In addition to wallet bonuses, every qualifying referral contributes towards unlocking free spins with instant cash and gift prizes.
          </div>
        </div>

        {loadingTerms && (
          <div className="animate-pulse bg-slate-100 h-16 rounded-xl" />
        )}

        {terms && terms.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-[#344054] mb-2 flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-blue-500" />
              Terms &amp; Conditions
            </h4>
            {terms.map((t, idx) => (
              <div key={t._id || idx} className="text-xs text-[#475467] space-y-1">
                <p className="font-medium text-[#101828]">{t.title}</p>
                <div
                  className="prose prose-xs max-w-none text-[#667085]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(t.body),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralRulesCard;
