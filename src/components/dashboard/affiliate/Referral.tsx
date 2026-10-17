import { copyToClipboard, formatAmount } from "@/lib/utils";
import { Check, Copy, Users, Wallet, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import useBackButtonStore from "@/stores/useBackButtonStore";
import BackButton from "@/components/Authentication/BackButton";
import { SpinRewardBanner } from "../rewards/SpinRewardBanner";
import { SpinHistorySection } from "../rewards/SpinHistorySection";
import { useAuth } from "@/context/AuthContext";
import { getUser } from "@/lib/api/authApi";
import { getReferrals, getReferralStats, ReferralResponse, ReferralStats } from "@/lib/api/dashboard-apis/referralsApis";
import ReferralRulesCard from "./ReferralRulesCard";
import { toast } from "sonner";

const Referral = () => {
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const { user: authUser } = useAuth();
    const { setButtonUrl } = useBackButtonStore();

    // Fresh profile to ensure latest userType and influencerRules
    const { data: profile } = useQuery({
        queryKey: ["profile"],
        queryFn: getUser,
        staleTime: 1000 * 60 * 5,
    });

    const activeUser = profile || authUser;
    const refCode = activeUser?.refCode || "";
    const referralLink = refCode
        ? `${typeof window !== "undefined" ? window.location.origin : "https://app.paymint.ca"}/auth/register?ref=${refCode}`
        : "";

    // Stats endpoint
    const { data: stats, isLoading: loadingStats } = useQuery<ReferralStats>({
        queryKey: ["referral-stats"],
        queryFn: getReferralStats,
        staleTime: 1000 * 30,
    });

    // Downlines / referred users list
    const { data: referralsData, isLoading: loadingReferrals } = useQuery<ReferralResponse>({
        queryKey: ["referrals"],
        queryFn: getReferrals,
        staleTime: 1000 * 30,
    });

    const referralsList = referralsData?.data?.[0]?.referrals || [];
    const totalReferred = stats?.totalReferrals ?? referralsList.length;
    const totalEarned = stats?.totalEarned ?? (referralsData?.data?.[0]?.totalReferralBonusEarned ?? 0);
    const paidAmount = stats?.paidAmount ?? 0;
    const pendingAmount = stats?.pendingAmount ?? 0;

    useEffect(() => {
        setButtonUrl("/dashboard/affiliate");
        return () => {
            setButtonUrl(null);
        };
    }, [setButtonUrl]);

    const handleCopy = async (text: string, isLink: boolean) => {
        if (!text) return;
        await copyToClipboard(text);
        if (isLink) {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
        toast.success(isLink ? "Referral link copied!" : "Referral code copied!");
    };

    return (
        <section className="w-full max-w-[680px] mx-auto px-4 pb-12">
            <div className="flex items-center mb-6 mt-2 md:hidden">
                <BackButton icon href="/dashboard/affiliate" />
                <p className="text-[#667085] font-medium text-xl w-full text-center mr-6">Referrals</p>
            </div>

            <div className="max-md:hidden text-center mb-2">
                <h1 className="text-[var(--aqua)] font-bold text-2xl md:text-3xl">Referral Program</h1>
            </div>
            <p className="text-[#344054] md:text-[#717171] text-sm md:text-base text-center mb-6">
                Share your unique link and earn cash bonuses for every friend who joins Paymint.
            </p>

            {/* Spin & Win Rewards Available Banner */}
            <SpinRewardBanner />

            {/* Referral Link & Code Box */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EAECF0] my-5 space-y-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#344054] block mb-1.5">
                        Your Referral Link
                    </label>
                    <div className="flex items-center justify-between bg-[#F8F9FC] rounded-xl py-2.5 px-3.5 border border-[#D0D5DD]">
                        <p className="text-[#475467] text-xs md:text-sm truncate mr-2 font-mono">
                            {referralLink || "Loading your link..."}
                        </p>
                        <button
                            type="button"
                            onClick={() => handleCopy(referralLink, true)}
                            disabled={!referralLink}
                            className="shrink-0 p-1.5 hover:bg-white rounded-lg transition text-[#344054] disabled:opacity-50"
                            title="Copy referral link"
                        >
                            {copiedLink ? (
                                <Check className="text-emerald-500 size-4" />
                            ) : (
                                <Copy className="size-4 hover:scale-110 transition" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#667085]">Referral Code:</span>
                        <span className="font-mono font-bold text-sm text-[var(--aqua)] bg-blue-50 px-2 py-0.5 rounded">
                            {refCode || "---"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleCopy(refCode, false)}
                        disabled={!refCode}
                        className="text-xs font-medium text-[var(--aqua)] hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                        {copiedCode ? (
                            <>
                                <Check className="size-3 text-emerald-500" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="size-3" /> Copy Code
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                <div className="bg-gradient-to-br from-[#00128F] to-[#0A2680] text-white rounded-2xl p-4 shadow-md col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-blue-200 text-xs mb-1">
                        <Users className="size-3.5" />
                        <span>Referred</span>
                    </div>
                    <p className="text-2xl font-bold tracking-tight">
                        {loadingStats ? "..." : totalReferred}
                    </p>
                    <span className="text-[10px] text-blue-300">Total signups</span>
                </div>

                <div className="bg-gradient-to-br from-[#0B2253] to-[#011438] text-white rounded-2xl p-4 shadow-md col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 text-xs mb-1">
                        <Wallet className="size-3.5" />
                        <span>Total Earned</span>
                    </div>
                    <p className="text-2xl font-bold tracking-tight">
                        {loadingStats ? "..." : formatAmount(totalEarned)}
                    </p>
                    <span className="text-[10px] text-emerald-400">All-time bonus</span>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EAECF0] col-span-1">
                    <div className="flex items-center gap-1.5 text-[#667085] text-xs mb-1">
                        <CheckCircle className="size-3.5 text-emerald-500" />
                        <span>Paid Out</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-[#101828]">
                        {loadingStats ? "..." : formatAmount(paidAmount)}
                    </p>
                    <span className="text-[10px] text-slate-400">Credited</span>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EAECF0] col-span-1">
                    <div className="flex items-center gap-1.5 text-[#667085] text-xs mb-1">
                        <Clock className="size-3.5 text-amber-500" />
                        <span>Pending</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-[#101828]">
                        {loadingStats ? "..." : formatAmount(pendingAmount)}
                    </p>
                    <span className="text-[10px] text-slate-400">Processing</span>
                </div>
            </div>

            {/* Influencer or Regular Referral Rules Card */}
            <ReferralRulesCard user={activeUser} />

            {/* Real Referral List */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EAECF0] my-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base text-[#101828]">Your Referrals</h3>
                    <span className="text-xs text-[#667085] bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                        {referralsList.length} user{referralsList.length === 1 ? "" : "s"}
                    </span>
                </div>

                {loadingReferrals ? (
                    <div className="space-y-2 py-4">
                        <div className="animate-pulse bg-slate-100 h-12 rounded-xl" />
                        <div className="animate-pulse bg-slate-100 h-12 rounded-xl" />
                    </div>
                ) : referralsList.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {referralsList.map((ref) => {
                            const referee = ref.referredId;
                            const fullName =
                                `${referee?.firstname || ""} ${referee?.lastname || ""}`.trim() ||
                                referee?.username ||
                                referee?.email ||
                                "Referred User";
                            const dateStr = ref.createdAt
                                ? new Date(ref.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "Recent";
                            const bonusEarned = ref.totalAmount || 0;

                            return (
                                <div
                                    key={ref._id}
                                    className="py-3 flex items-center justify-between gap-3 text-xs md:text-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-blue-50 text-[var(--aqua)] font-bold flex items-center justify-center shrink-0">
                                            {fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#101828]">{fullName}</p>
                                            <p className="text-[#667085] text-xs">{dateStr}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-emerald-600">
                                            +{formatAmount(bonusEarned)}
                                        </p>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                                referee?.status === "active"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {referee?.status || "active"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 px-4">
                        <div className="size-12 rounded-full bg-blue-50 text-[var(--aqua)] mx-auto flex items-center justify-center mb-3">
                            <Users className="size-6" />
                        </div>
                        <h4 className="font-medium text-sm text-[#101828]">No referrals yet</h4>
                        <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                            Share your referral link with friends and start earning milestone bonuses when they trade or pay bills.
                        </p>
                    </div>
                )}
            </div>

            {/* Past Spin Rewards History */}
            <SpinHistorySection />
        </section>
    );
};

export default Referral;