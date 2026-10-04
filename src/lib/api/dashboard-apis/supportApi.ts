import api from "../axios";
import type {
  ActiveTicketResponse,
  OpenTicketResponse,
  MessagesResponse,
  CloseTicketResponse,
} from "@/types/support";

// ─── 3.1  Check Active Ticket ────────────────────────────────────────────────
export const checkActiveTicket = async (): Promise<ActiveTicketResponse> => {
  const res = await api.get("/client/support/tickets/active");
  return res.data;
};

// ─── 3.2  Open / Initialise Ticket ──────────────────────────────────────────
export interface OpenTicketApiPayload {
  category: string;
  initialMessage: string;
  transactionReference?: string;
}

export const openSupportTicket = async (
  payload: OpenTicketApiPayload
): Promise<OpenTicketResponse> => {
  const res = await api.post("/client/support/tickets", payload);
  return res.data;
};

// ─── 3.3  Fetch Messages (cursor pagination) ─────────────────────────────────
export interface FetchMessagesParams {
  ticketId: string;
  limit?: number;
  before?: string; // scroll-up (load older)
  after?: string;  // reconnect catch-up (load newer)
}

export const fetchSupportMessages = async ({
  ticketId,
  limit = 25,
  before,
  after,
}: FetchMessagesParams): Promise<MessagesResponse> => {
  const res = await api.get(`/client/support/tickets/${ticketId}/messages`, {
    params: {
      limit,
      ...(before ? { before } : {}),
      ...(after ? { after } : {}),
    },
  });
  return res.data;
};

// ─── 3.4  Close Ticket ───────────────────────────────────────────────────────
export const closeSupportTicket = async (
  ticketId: string
): Promise<CloseTicketResponse> => {
  const res = await api.post(
    `/client/support/tickets/${ticketId}/close`,
    {}
  );
  return res.data;
};
