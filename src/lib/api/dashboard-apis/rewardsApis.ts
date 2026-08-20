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
