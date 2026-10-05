import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import useSupportStore from "@/stores/useSupportStore";
import type {
  SupportMessage,
  SocketTypingPayload,
  SocketEscalatedPayload,
  SocketClaimedPayload,
  SocketResolvedPayload,
  SocketRateLimitedPayload,
  SocketTicketClosedPayload,
} from "@/types/support";

// ─── Mirror getSocketUrl() from useWalletSocket ──────────────────────────────
const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    "https://paymint.qoreformasolutionlimited.com.ng/api/v1";
  try {
    const url = new URL(apiBase);
    return url.origin;
  } catch {
    return "https://paymint.qoreformasolutionlimited.com.ng";
  }
};

// ─── Typing indicator auto-clear timeout (ms) ───────────────────────────────
const TYPING_CLEAR_MS = 4000;

// ─── Module-level singleton socket ──────────────────────────────────────────
let sharedSocket: Socket | null = null;
let activeToken: string | null = null;

function setupSharedSocket(accessToken: string) {
  if (sharedSocket && activeToken === accessToken && sharedSocket.connected) {
    return sharedSocket;
  }

  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }

  activeToken = accessToken;
  const socketUrl = getSocketUrl();
  const socket: Socket = io(`${socketUrl}/support`, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  sharedSocket = socket;

  socket.on("connect", () => {
    console.log("🟢 Minty Support Socket connected:", socket.id);
  });

  // ── support:message ──────────────────────────────────────────────────────
  socket.on("support:message", (message: SupportMessage) => {
    console.log("💬 [Support Socket] Message:", message);
    const store = useSupportStore.getState();
    store.setIsTyping(false, null);
    store.appendMessage(message);

    // If an agent sent a message, ticket is active with that agent
    if (message.sender === "agent") {
      store.setTicketStatus("active");
      if (message.senderName) {
        store.setEscalationInfo({ agentName: message.senderName });
      }
    }

    // If Minty is asking for resolve feedback, flag it
    if (
      message.type === "action" &&
      message.metadata?.action === "RESOLVE_CONFIRMATION"
    ) {
      store.setAwaitingResolveFeedback(true);
    }
  });

  // ── support:typing ───────────────────────────────────────────────────────
  let typingTimer: NodeJS.Timeout | null = null;
  socket.on("support:typing", (payload: SocketTypingPayload) => {
    console.log("✍️ [Support Socket] Typing:", payload.senderName);
    const store = useSupportStore.getState();
    store.setIsTyping(true, payload.senderName);

    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      useSupportStore.getState().setIsTyping(false, null);
    }, TYPING_CLEAR_MS);
  });

  // ── support:ticket_escalated ─────────────────────────────────────────────
  socket.on("support:ticket_escalated", (payload: SocketEscalatedPayload) => {
    console.log("📋 [Support Socket] Ticket escalated:", payload);
    const store = useSupportStore.getState();
    store.setTicketStatus("queued");
    store.setEscalationInfo({
      queuePosition: payload.queuePosition,
      estimatedWaitMinutes: payload.estimatedWaitMinutes,
    });
  });

  // ── support:ticket_claimed ───────────────────────────────────────────────
  socket.on("support:ticket_claimed", (payload: SocketClaimedPayload) => {
    console.log("🧑‍💼 [Support Socket] Ticket claimed:", payload);
    const store = useSupportStore.getState();
    store.setTicketStatus("active");
    store.setEscalationInfo({ agentName: payload.adminName });
  });

  // ── support:ticket_resolved ──────────────────────────────────────────────
  socket.on("support:ticket_resolved", (payload: SocketResolvedPayload) => {
    console.log("✅ [Support Socket] Ticket resolved:", payload);
    useSupportStore.getState().setAwaitingResolveFeedback(true);
  });

  // ── support:rate_limited ─────────────────────────────────────────────────
  socket.on("support:rate_limited", (payload: SocketRateLimitedPayload) => {
    console.warn("⏳ [Support Socket] Rate limited:", payload.message);
    useSupportStore.getState().setRateLimited(true, payload.retryAfterMs);
  });

  // ── support:ticket_closed ────────────────────────────────────────────────
  socket.on("support:ticket_closed", (payload: SocketTicketClosedPayload) => {
    console.log("🔒 [Support Socket] Ticket closed:", payload);
    const store = useSupportStore.getState();
    store.setTicketStatus("closed");
    store.setAwaitingResolveFeedback(false);
  });

  socket.on("connect_error", (error) => {
    console.warn("⚠️ Minty Support Socket connection error:", error.message);
  });

  return socket;
}

export const useSupportSocket = () => {
  const { accessToken } = useAuth();
  const { ticket, appendMessage } = useSupportStore();

  useEffect(() => {
    if (!accessToken) {
      if (sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        activeToken = null;
      }
      return;
    }

    setupSharedSocket(accessToken);
  }, [accessToken]);

  // ── Helpers exposed to UI ──────────────────────────────────────────────────

  const joinTicket = useCallback((ticketId: string) => {
    sharedSocket?.emit("support:join", { ticketId }, (res: { ok: boolean }) => {
      console.log("✅ support:join ack:", res);
    });
  }, []);

  const openTicketViaSocket = useCallback(
    (payload: { category?: string; initialMessage?: string; transactionReference?: string }) => {
      return new Promise<{ ok: boolean; ticketId: string; isNew: boolean }>((resolve, reject) => {
        if (!sharedSocket) return reject(new Error("Socket not connected"));
        sharedSocket.emit("support:open", payload, (res: { ok: boolean; ticketId: string; isNew: boolean }) => {
          resolve(res);
        });
      });
    },
    []
  );

  const sendMessage = useCallback((ticketId: string, text: string) => {
    return new Promise<{ ok: boolean }>((resolve, reject) => {
      if (!sharedSocket) return reject(new Error("Socket not connected"));
      sharedSocket.emit("support:message", { ticketId, text }, (res: { ok: boolean }) => {
        resolve(res);
      });
    });
  }, []);

  const sendResolveFeedback = useCallback(
    (ticketId: string, confirmed: boolean) => {
      return new Promise<{ ok: boolean; closed: boolean }>((resolve, reject) => {
        if (!sharedSocket) return reject(new Error("Socket not connected"));
        sharedSocket.emit(
          "support:resolve_feedback",
          { ticketId, confirmed },
          (res: { ok: boolean; closed: boolean }) => {
            resolve(res);
          }
        );
      });
    },
    []
  );

  const syncMessages = useCallback((ticketId: string, after: string) => {
    sharedSocket?.emit("support:sync", { ticketId, after }, (res: { ok: boolean; messages: SupportMessage[] }) => {
      if (res.ok && res.messages.length > 0) {
        res.messages.forEach((m) => appendMessage(m));
      }
    });
  }, [appendMessage]);

  // Re-join the room when ticket changes and socket is already connected
  useEffect(() => {
    if (sharedSocket?.connected && ticket?._id) {
      joinTicket(ticket._id);
    }
  }, [ticket?._id, joinTicket]);

  return {
    socket: sharedSocket,
    joinTicket,
    openTicketViaSocket,
    sendMessage,
    sendResolveFeedback,
    syncMessages,
  };
};
