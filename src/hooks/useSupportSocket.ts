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

export const useSupportSocket = () => {
  const { accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    ticket,
    appendMessage,
    setIsTyping,
    setTicketStatus,
    setEscalationInfo,
    setAwaitingResolveFeedback,
    setRateLimited,
  } = useSupportStore();

  // ── Connect / disconnect based on auth ─────────────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current) return;

    const socketUrl = getSocketUrl();
    const socket: Socket = io(`${socketUrl}/support`, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Minty Support Socket connected:", socket.id);
    });

    // ── support:message ──────────────────────────────────────────────────────
    socket.on("support:message", (message: SupportMessage) => {
      console.log("💬 [Support Socket] Message:", message);
      // Clear typing indicator when a message arrives
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setIsTyping(false, null);
      appendMessage(message);

      // If Minty is asking for resolve feedback, flag it
      if (
        message.type === "action" &&
        message.metadata?.action === "RESOLVE_CONFIRMATION"
      ) {
        setAwaitingResolveFeedback(true);
      }
    });

    // ── support:typing ───────────────────────────────────────────────────────
    socket.on("support:typing", (payload: SocketTypingPayload) => {
      console.log("✍️ [Support Socket] Typing:", payload.senderName);
      setIsTyping(true, payload.senderName);

      // Auto-clear after timeout in case stop event is missed
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false, null);
      }, TYPING_CLEAR_MS);
    });

    // ── support:ticket_escalated ─────────────────────────────────────────────
    socket.on("support:ticket_escalated", (payload: SocketEscalatedPayload) => {
      console.log("📋 [Support Socket] Ticket escalated:", payload);
      setTicketStatus("queued");
      setEscalationInfo({
        queuePosition: payload.queuePosition,
        estimatedWaitMinutes: payload.estimatedWaitMinutes,
      });
    });

    // ── support:ticket_claimed ───────────────────────────────────────────────
    socket.on("support:ticket_claimed", (payload: SocketClaimedPayload) => {
      console.log("🧑‍💼 [Support Socket] Ticket claimed:", payload);
      setTicketStatus("active");
      setEscalationInfo({ agentName: payload.adminName });
    });

    // ── support:ticket_resolved ──────────────────────────────────────────────
    socket.on("support:ticket_resolved", (payload: SocketResolvedPayload) => {
      console.log("✅ [Support Socket] Ticket resolved:", payload);
      setAwaitingResolveFeedback(true);
    });

    // ── support:rate_limited ─────────────────────────────────────────────────
    socket.on("support:rate_limited", (payload: SocketRateLimitedPayload) => {
      console.warn("⏳ [Support Socket] Rate limited:", payload.message);
      setRateLimited(true, payload.retryAfterMs);
    });

    // ── support:ticket_closed ────────────────────────────────────────────────
    socket.on("support:ticket_closed", (payload: SocketTicketClosedPayload) => {
      console.log("🔒 [Support Socket] Ticket closed:", payload);
      setTicketStatus("closed");
      setAwaitingResolveFeedback(false);
    });

    socket.on("connect_error", (error) => {
      console.warn("⚠️ Minty Support Socket connection error:", error.message);
    });

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.off("connect");
      socket.off("support:message");
      socket.off("support:typing");
      socket.off("support:ticket_escalated");
      socket.off("support:ticket_claimed");
      socket.off("support:ticket_resolved");
      socket.off("support:rate_limited");
      socket.off("support:ticket_closed");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]); // intentionally omit store actions — they are stable

  // ── Helpers exposed to UI ──────────────────────────────────────────────────

  const joinTicket = useCallback((ticketId: string) => {
    socketRef.current?.emit("support:join", { ticketId }, (res: { ok: boolean }) => {
      console.log("✅ support:join ack:", res);
    });
  }, []);

  const openTicketViaSocket = useCallback(
    (payload: { category?: string; initialMessage?: string; transactionReference?: string }) => {
      return new Promise<{ ok: boolean; ticketId: string; isNew: boolean }>((resolve, reject) => {
        if (!socketRef.current) return reject(new Error("Socket not connected"));
        socketRef.current.emit("support:open", payload, (res: { ok: boolean; ticketId: string; isNew: boolean }) => {
          resolve(res);
        });
      });
    },
    []
  );

  const sendMessage = useCallback((ticketId: string, text: string) => {
    return new Promise<{ ok: boolean }>((resolve, reject) => {
      if (!socketRef.current) return reject(new Error("Socket not connected"));
      socketRef.current.emit("support:message", { ticketId, text }, (res: { ok: boolean }) => {
        resolve(res);
      });
    });
  }, []);

  const sendResolveFeedback = useCallback(
    (ticketId: string, confirmed: boolean) => {
      return new Promise<{ ok: boolean; closed: boolean }>((resolve, reject) => {
        if (!socketRef.current) return reject(new Error("Socket not connected"));
        socketRef.current.emit(
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
    socketRef.current?.emit("support:sync", { ticketId, after }, (res: { ok: boolean; messages: SupportMessage[] }) => {
      if (res.ok && res.messages.length > 0) {
        res.messages.forEach((m) => appendMessage(m));
      }
    });
  }, [appendMessage]);

  // Re-join the room when ticket changes and socket is already connected
  useEffect(() => {
    if (socketRef.current?.connected && ticket?._id) {
      joinTicket(ticket._id);
    }
  }, [ticket?._id, joinTicket]);

  return {
    socket: socketRef.current,
    joinTicket,
    openTicketViaSocket,
    sendMessage,
    sendResolveFeedback,
    syncMessages,
  };
};
