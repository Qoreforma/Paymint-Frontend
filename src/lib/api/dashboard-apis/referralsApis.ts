import api from "../axios";

export interface ReferredUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  country?: string;
  username?: string;
  avatar?: string;
}

export interface BonusMilestone {
  _id: string;
  bonusConfigId: string;
  bonusAmount: number;
  earnedAt: string;
  status: "paid" | "pending";
  paidAt?: string;
}

export interface Referral {
  _id: string;
  refereeId: string;
  referredId: ReferredUser;
  userType: "regular" | "vip";
  bonusMilestones: BonusMilestone[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalAmount: number;
}

export type ReferralData = {
  referrals: Referral[];
  totalReferralBonusEarned: number;
}[];

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: number;
  hasPrev: number;
};

export type ReferralResponse = {
  data: ReferralData;
  pagination: Pagination;
};

export interface RefereeUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  username?: string;
  avatar?: string;
}

export interface UplineData {
  _id: string;
  refereeId: RefereeUser;
  referredId: string;
  userType: "regular" | "vip";
  bonusMilestones: BonusMilestone[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}


export interface ReferralStats {
  totalReferrals: number;
  qualifiedReferrals: number;
  paidReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface ReferralTerm {
  _id?: string;
  title: string;
  body: string;
  slug?: string;
}

export interface BonusRuleCard {
  title: string;
  description: string;
}

export interface ReferralBonusRule {
  _id?: string;
  amount: number;
  reward: number;
  isActive?: boolean;
  one?: BonusRuleCard;
  two?: BonusRuleCard;
  three?: BonusRuleCard;
  [key: string]: any;
}



export const getReferrals = async () => {
    const response = await api.get("/referrals");
    return response.data;
}   

export const getUpline = async () => {
    const response = await api.get("/referrals/upline");
    return response.data?.data;
}   

export const getReferralStats = async (): Promise<ReferralStats> => {
    const response = await api.get("/referrals/stats");
    return response.data?.data;
}

export const getReferralTerms = async (): Promise<ReferralTerm[]> => {
    const response = await api.get("/referrals/terms");
    const data = response.data?.data;
    return Array.isArray(data) ? data : data ? [data] : [];
}   

/**
 * Returns the active referral bonus rule (amount, todo, reward).
 * Used on the referral terms/rules card in the UI.
 */
export const getReferralBonusRule = async (): Promise<ReferralBonusRule | null> => {
    const response = await api.get("/referrals/bonus-rule");
    return response.data?.data ?? null;
}