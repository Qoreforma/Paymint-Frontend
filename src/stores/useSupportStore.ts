import { create } from "zustand";
import type { SupportMessage, SupportTicket, SupportTicketStatus } from "@/types/support";

interface EscalationInfo {
  queuePosition?: number;
  estimatedWaitMinutes?: number;
  agentName?: string;
}

interface SupportStore {
  // ── UI state ──────────────────────────────────────────────────────────────
  isOpen: boolean;

  // ── Ticket ────────────────────────────────────────────────────────────────
  ticket: SupportTicket | null;
  ticketStatus: SupportTicketStatus | null;

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: SupportMessage[];
  hasMore: boolean;
  nextCursor: string | null;

  // ── Real-time indicators ──────────────────────────────────────────────────
  isTyping: boolean;
  typingSender: string | null; // "Minty" | agent name

  // ── Escalation / resolution ───────────────────────────────────────────────
  escalationInfo: EscalationInfo | null;
  /** Ticket is pending user yes/no resolution feedback */
  awaitingResolveFeedback: boolean;

  // ── Rate-limit ────────────────────────────────────────────────────────────
  rateLimited: boolean;
  rateLimitedUntil: number | null; // epoch ms

  // ── Actions ───────────────────────────────────────────────────────────────
  setOpen: (open: boolean) => void;
  setTicket: (ticket: SupportTicket | null) => void;
  setTicketStatus: (status: SupportTicketStatus | null) => void;
  setMessages: (messages: SupportMessage[]) => void;
  prependMessages: (messages: SupportMessage[]) => void; // load-older scroll-up
  appendMessage: (message: SupportMessage) => void;
  replaceOptimisticMessage: (tempId: string, confirmed: SupportMessage) => void;
  setIsTyping: (typing: boolean, sender?: string | null) => void;
  setEscalationInfo: (info: EscalationInfo | null) => void;
  setAwaitingResolveFeedback: (waiting: boolean) => void;
  setRateLimited: (limited: boolean, retryAfterMs?: number) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  ticket: null,
  ticketStatus: null,
  messages: [],
  hasMore: false,
  nextCursor: null,
  isTyping: false,
  typingSender: null,
  escalationInfo: null,
  awaitingResolveFeedback: false,
  rateLimited: false,
  rateLimitedUntil: null,
};

const useSupportStore = create<SupportStore>((set, get) => ({
  ...initialState,

  setOpen: (open) => set({ isOpen: open }),

  setTicket: (ticket) =>
    set({ ticket, ticketStatus: ticket?.status ?? null }),

  setTicketStatus: (status) =>
    set((state) => ({
      ticketStatus: status,
      ticket: state.ticket ? { ...state.ticket, status: status! } : null,
    })),

  setMessages: (messages) => set({ messages }),

  prependMessages: (messages) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
    })),

  appendMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  replaceOptimisticMessage: (tempId, confirmed) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === tempId ? confirmed : m
      ),
    })),

  setIsTyping: (typing, sender = null) =>
    set({ isTyping: typing, typingSender: sender }),

  setEscalationInfo: (info) => set({ escalationInfo: info }),

  setAwaitingResolveFeedback: (waiting) =>
    set({ awaitingResolveFeedback: waiting }),

  setRateLimited: (limited, retryAfterMs) => {
    if (limited && retryAfterMs) {
      const until = Date.now() + retryAfterMs;
      set({ rateLimited: true, rateLimitedUntil: until });
      setTimeout(() => {
        if (get().rateLimitedUntil === until) {
          set({ rateLimited: false, rateLimitedUntil: null });
        }
      }, retryAfterMs);
    } else {
      set({ rateLimited: false, rateLimitedUntil: null });
    }
  },

  reset: () => set(initialState),
}));

export default useSupportStore;
