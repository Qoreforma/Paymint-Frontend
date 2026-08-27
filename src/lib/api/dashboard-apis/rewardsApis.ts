import api from "../axios";

export interface WheelSegment {
  label: string;
  rewardType: "airtime" | "balance";
  rewardValue: number;
  displayColor: string;
  ticketCount: number;
}

export interface SpinWheelConfigSnapshot {
  _id: string;
  poolSize: number;
  segments: WheelSegment[];
  airtimeRecipientMode: "auto" | "user-choice";
}

export interface RewardTierInfo {
  _id: string;
  name: string;
  referralThreshold: number;
  repeatMode: "one-time" | "repeatable" | "max-N";
}

export interface AvailableSpinTicket {
  _id: string;
  tierId: RewardTierInfo;
  earnedAt: string;
  status: "pending" | "claimed" | "expired";
  wheelConfig: SpinWheelConfigSnapshot | null;
}

export interface SpinResultItem {
  _id: string;
  userId: string;
  tierId: {
    _id: string;
    name: string;
  };
  spinTicketId: string;
  wheelConfigSnapshot: SpinWheelConfigSnapshot;
  wonSegment: {
    label: string;
    rewardType: "airtime" | "balance";
    rewardValue: number;
    displayColor: string;
  };
  rewardType: "airtime" | "balance";
  rewardValue: number;
  resolvedAt: string;
  payoutStatus: "pending" | "success" | "failed";
  recipientNumber?: string;
}

export interface ClaimSpinResponse {
  isDuplicate?: boolean;
  result: SpinResultItem;
  winningSegmentIndex: number;
  wonSegment: {
    label: string;
    rewardType: "airtime" | "balance";
    rewardValue: number;
    displayColor: string;
  };
}

// ─── Catalogue ────────────────────────────────────────────────────────────────

export interface RewardCatalogueItem {
  tierId: string;
  tierName: string;
  description?: string;
  referralThreshold: number;
  repeatMode: "one-time" | "repeatable" | "max-N";
  maxRepeatCount: number | null;
  perUserCap: number | null;
  wheelConfig: {
    _id: string;
    poolSize: number;
    airtimeRecipientMode: "auto" | "user-choice";
    segments: WheelSegment[];
  } | null;
}

// ─── Tier Progress ────────────────────────────────────────────────────────────

export type QualificationRuleType =
  | "all-time-count"
  | "new-since-last-claim"
  | "referee-profile-complete"
  | "referee-min-transaction-value"
  | "referee-setup-account";

export interface QualificationRuleInfo {
  type: QualificationRuleType;
  description?: string;
  /** Only present for referee-min-transaction-value */
  minTransactionValue?: number;
}

export interface TierProgressResponse {
  currentTier: {
    tierId: string;
    tierName: string;
    referralThreshold: number;
    repeatMode: "one-time" | "repeatable" | "max-N";
    qualificationRule: QualificationRuleInfo;
  };
  progress: {
    /** Raw total referrals the user has ever made */
    totalReferrals: number;
    /** Referrals that pass the tier's qualification rule */
    qualifyingReferrals: number;
    /** Referrals that exist but don't yet pass the rule (e.g. friend hasn't verified) */
    pendingReferrals: number;
    /** Qualifying referrals already counted toward past spin earnings */
    countedReferrals: number;
    /** How many MORE qualifying referrals are needed to earn the next spin */
    referralsToNextSpin: number;
    /** Total spin tickets earned on this tier (spun or un-spun) */
    totalSpinsEarned: number;
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getAvailableSpinTickets = async (): Promise<AvailableSpinTicket[]> => {
  const response = await api.get("/rewards/spin-tickets");
  return response.data?.data || [];
};

export const getSpinHistory = async (
  page: number = 1,
  limit: number = 10
): Promise<{ data: SpinResultItem[]; total: number }> => {
  const response = await api.get(`/rewards/spin-history?page=${page}&limit=${limit}`);
  return response.data?.data || { data: [], total: 0 };
};

export const claimSpin = async (
  spinTicketId: string,
  recipientNumber?: string
): Promise<ClaimSpinResponse> => {
  const response = await api.post("/rewards/claim", {
    spinTicketId,
    ...(recipientNumber ? { recipientNumber } : {}),
  });
  return response.data?.data;
};

/**
 * Returns all active reward tiers with their wheel configurations.
 * Used to render the "what you can win" preview screen.
 */
export const getRewardCatalogue = async (): Promise<RewardCatalogueItem[]> => {
  const response = await api.get("/rewards/catalogue");
  return response.data?.data || [];
};

/**
 * Returns the authenticated user's current active tier and referral progress.
 * Returns null if the system is disabled or all tiers are completed.
 */
export const getUserTierProgress = async (): Promise<TierProgressResponse | null> => {
  const response = await api.get("/rewards/my-progress");
  return response.data?.data ?? null;
};

