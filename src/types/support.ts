// ─── Ticket ────────────────────────────────────────────────────────────────

export type SupportTicketStatus =
  | "bot"
  | "queued"
  | "active"
  | "resolved"
  | "closed";

export type SupportTicketPriority = "normal" | "high" | "urgent";

export type SupportCategory =
  | "General"
  | "Bill Payment"
  | "Transfer"
  | "Funding"
  | "Account / KYC"
  | "PIN Issues"
  | "Referrals"
  | "Other";

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  userId: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: SupportCategory | string;
  transactionReference?: string | null;
  lastMessageSnippet?: string | null;
  createdAt: string;
}

// ─── Messages ───────────────────────────────────────────────────────────────

export type MessageSender = "bot" | "agent" | "user" | "system";
export type MessageType = "text" | "action" | "image" | "system";

export type ActionType = "NAVIGATE" | "OPEN_TAB" | "RESOLVE_CONFIRMATION";

export interface MessageMetadata {
  action: ActionType;
  // NAVIGATE
  screen?: string;
  buttonLabel?: string;
  // OPEN_TAB
  tab?: "home" | "history" | "referrals" | "settings";
  // RESOLVE_CONFIRMATION
  options?: string[];
}

export interface SupportMessage {
  _id: string;
  ticketId: string;
  sender: MessageSender;
  senderName?: string;
  text: string;
  type: MessageType;
  metadata?: MessageMetadata;
  createdAt: string;
  /** Optimistic flag — not from server */
  pending?: boolean;
}

// ─── REST API Responses ─────────────────────────────────────────────────────

export interface ActiveTicketResponse {
  status: "success";
  message: string;
  data: SupportTicket | null;
}

export interface OpenTicketResponse {
  status: "success";
  message: string;
  data: {
    ticket: SupportTicket;
    isNew: boolean;
    greetingMessage?: string;
  };
}

export interface MessagesResponse {
  status: "success";
  message: string;
  data: {
    messages: SupportMessage[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface CloseTicketResponse {
  status: "success";
  message: string;
  data: {
    _id: string;
    status: "closed";
    closeReason: string;
    closedAt: string;
  };
}

// ─── Socket Payloads (Server → Client) ──────────────────────────────────────

export interface SocketTypingPayload {
  ticketId: string;
  sender: "bot" | "agent";
  senderName: string;
}

export interface SocketEscalatedPayload {
  ticketId: string;
  status: "queued";
  priority: SupportTicketPriority;
  queuePosition: number;
  estimatedWaitMinutes: number;
}

export interface SocketClaimedPayload {
  ticketId: string;
  adminName: string;
  message: string;
}

export interface SocketResolvedPayload {
  ticketId: string;
  adminName?: string;
  message: string;
}

export interface SocketRateLimitedPayload {
  message: string;
  retryAfterMs: number;
}

export interface SocketTicketClosedPayload {
  ticketId: string;
  reason: "resolved" | "user_closed" | "admin_closed" | "auto_timeout";
}

// ─── Socket Payloads (Client → Server) ──────────────────────────────────────

export interface OpenTicketPayload {
  category?: string;
  initialMessage?: string;
  transactionReference?: string;
}

export interface JoinTicketPayload {
  ticketId: string;
}

export interface SendMessagePayload {
  ticketId: string;
  text: string;
}

export interface ResolveFeedbackPayload {
  ticketId: string;
  confirmed: boolean;
}

export interface SyncPayload {
  ticketId: string;
  after: string;
}

// ─── Quick Topic Chips ───────────────────────────────────────────────────────

export interface TopicChip {
  label: string;
  category: SupportCategory | string;
  initialMessage: string;
  emoji: string;
}

export const TOPIC_CHIPS: TopicChip[] = [
  {
    label: "Report Transaction",
    category: "Bill Payment",
    initialMessage: "I have an issue with a transaction",
    emoji: "💳",
  },
  {
    label: "Account / KYC",
    category: "Account / KYC",
    initialMessage: "I need help with my account or KYC verification",
    emoji: "🪪",
  },
  {
    label: "PIN Issues",
    category: "PIN Issues",
    initialMessage: "I'm having issues with my PIN",
    emoji: "🔐",
  },
  {
    label: "Something Else",
    category: "General",
    initialMessage: "I need some help",
    emoji: "💬",
  },
];