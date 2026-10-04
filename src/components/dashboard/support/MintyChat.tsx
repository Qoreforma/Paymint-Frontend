import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import useSupportStore from "@/stores/useSupportStore";
import { useSupportSocket } from "@/hooks/useSupportSocket";
import {
  checkActiveTicket,
  openSupportTicket,
  fetchSupportMessages,
} from "@/lib/api/dashboard-apis/supportApi";
import type { SupportMessage, TopicChip } from "@/types/support";
import { TOPIC_CHIPS } from "@/types/support";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateTempId() {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-brand animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const MintyAvatar = ({ size = 32 }: { size?: number }) => (
  <div
    className="shrink-0 rounded-full bg-brand flex items-center justify-center font-display font-bold text-white select-none"
    style={{ width: size, height: size, fontSize: size * 0.4 }}
  >
    M
  </div>
);

const EscalationBanner = () => {
  const { ticketStatus, escalationInfo } = useSupportStore();

  if (ticketStatus === "queued") {
    return (
      <div className="mx-3 mb-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800 font-display">
          🧑‍💼 Connecting you to an agent…
        </p>
        {escalationInfo?.queuePosition && (
          <p className="text-amber-700 mt-0.5">
            Queue position: <strong>#{escalationInfo.queuePosition}</strong>
            {escalationInfo.estimatedWaitMinutes
              ? ` · ~${escalationInfo.estimatedWaitMinutes} min wait`
              : ""}
          </p>
        )}
      </div>
    );
  }

  if (ticketStatus === "active" && escalationInfo?.agentName) {
    return (
      <div className="mx-3 mb-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm">
        <p className="font-semibold text-green-800 font-display">
          ✅ {escalationInfo.agentName} has joined the chat
        </p>
        <p className="text-green-700 mt-0.5">You're now chatting with a live agent.</p>
      </div>
    );
  }

  return null;
};

interface BubbleProps {
  message: SupportMessage;
  onAction?: (label: string, metadata: SupportMessage["metadata"]) => void;
  onResolveFeedback?: (confirmed: boolean) => void;
  awaitingFeedback?: boolean;
  feedbackDone?: boolean;
}

const Bubble = ({
  message,
  onAction,
  onResolveFeedback,
  awaitingFeedback,
  feedbackDone,
}: BubbleProps) => {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system" || message.type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-slate bg-slate/10 rounded-full px-3 py-1">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"} items-end mb-3`}>
      {!isUser && <MintyAvatar size={28} />}

      <div className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        {!isUser && (
          <span className="text-[11px] font-semibold text-slate mb-1 ml-1">
            {message.senderName ?? "Minty"}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-brand text-white rounded-br-sm"
              : message.pending
              ? "bg-gray-100 text-gray-400 rounded-bl-sm"
              : "bg-white text-[#101928] border border-gray-100 rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>

        {/* Action button (NAVIGATE / OPEN_TAB) */}
        {message.type === "action" &&
          message.metadata?.action !== "RESOLVE_CONFIRMATION" &&
          message.metadata?.buttonLabel && (
            <button
              onClick={() => onAction?.(message.metadata!.buttonLabel!, message.metadata)}
              className="mt-2 text-sm font-semibold text-brand border border-brand rounded-full px-4 py-1.5 hover:bg-brand hover:text-white transition-colors duration-150"
            >
              {message.metadata.buttonLabel}
            </button>
          )}

        {/* Resolve confirmation pills */}
        {message.type === "action" &&
          message.metadata?.action === "RESOLVE_CONFIRMATION" && (
            <div className="mt-2 flex gap-2">
              {feedbackDone ? (
                <span className="text-xs text-slate italic">Feedback sent ✓</span>
              ) : (
                <>
                  <button
                    disabled={!awaitingFeedback}
                    onClick={() => onResolveFeedback?.(true)}
                    className="text-sm font-semibold bg-money-in text-white rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    Yes, resolved ✓
                  </button>
                  <button
                    disabled={!awaitingFeedback}
                    onClick={() => onResolveFeedback?.(false)}
                    className="text-sm font-semibold border border-signal-red text-signal-red rounded-full px-4 py-1.5 hover:bg-signal-red hover:text-white transition-colors disabled:opacity-40"
                  >
                    No, still need help
                  </button>
                </>
              )}
            </div>
          )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate/60 mt-1 mx-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ─── Welcome screen ───────────────────────────────────────────────────────────

interface WelcomeScreenProps {
  onChipSelect: (chip: TopicChip) => void;
  loading: boolean;
}

const WelcomeScreen = ({ onChipSelect, loading }: WelcomeScreenProps) => (
  <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center gap-4">
    {/* Avatar */}
    <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
      <span className="text-2xl font-bold text-white font-display">M</span>
    </div>
    <div>
      <h2 className="text-lg font-bold font-display text-[#101928]">Hey there! 👋</h2>
      <p className="text-sm text-slate mt-1 leading-relaxed">
        I'm <strong>Minty</strong>, Paymint's AI support assistant.
        <br />
        What can I help you with today?
      </p>
    </div>

    {/* Topic chips */}
    <div className="grid grid-cols-2 gap-2 w-full mt-2">
      {TOPIC_CHIPS.map((chip) => (
        <button
          key={chip.label}
          disabled={loading}
          onClick={() => onChipSelect(chip)}
          className="flex flex-col items-start gap-1 rounded-2xl border border-gray-200 bg-white hover:border-brand hover:bg-blue-50 transition-colors duration-150 px-4 py-3 text-left disabled:opacity-50 shadow-sm"
        >
          <span className="text-xl">{chip.emoji}</span>
          <span className="text-sm font-semibold text-[#101928] font-display leading-tight">
            {chip.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);

// ─── Main MintyChat component ─────────────────────────────────────────────────

const MintyChat = () => {
  const { accessToken } = useAuth();
  const {
    isOpen,
    ticket,
    messages,
    isTyping,
    typingSender,
    awaitingResolveFeedback,
    rateLimited,
    ticketStatus,
    setOpen,
    setTicket,
    setMessages,
    appendMessage,
    replaceOptimisticMessage,
    setAwaitingResolveFeedback,
  } = useSupportStore();

  const { joinTicket, sendMessage, sendResolveFeedback } = useSupportSocket();

  const [inputText, setInputText] = useState("");
  const [initialising, setInitialising] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessageCountRef = useRef(0);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // ── Track unread when chat is closed ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen && messages.length > prevMessageCountRef.current) {
      setUnreadCount((c) => c + (messages.length - prevMessageCountRef.current));
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isOpen]);

  // ── Clear unread when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // ── On open: check active ticket ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !accessToken) return;
    if (ticket) return; // already have a ticket, don't re-check

    const initChat = async () => {
      setInitialising(true);
      try {
        const res = await checkActiveTicket();
        if (res.data) {
          setTicket(res.data);
          joinTicket(res.data._id);
          // Load message history
          const msgRes = await fetchSupportMessages({ ticketId: res.data._id });
          setMessages(msgRes.data.messages);
        }
      } catch (err) {
        console.error("[MintyChat] Failed to check active ticket:", err);
      } finally {
        setInitialising(false);
      }
    };

    initChat();
  }, [isOpen, accessToken]); // intentionally stable refs excluded

  // ── Open ticket when user selects a topic chip ────────────────────────────
  const handleChipSelect = useCallback(
    async (chip: TopicChip) => {
      setInitialising(true);
      try {
        const res = await openSupportTicket({
          category: chip.category,
          initialMessage: chip.initialMessage,
        });
        setTicket(res.data.ticket);
        joinTicket(res.data.ticket._id);

        // Show greeting from server as a bot message
        if (res.data.greetingMessage) {
          appendMessage({
            _id: generateTempId(),
            ticketId: res.data.ticket._id,
            sender: "bot",
            senderName: "Minty",
            text: res.data.greetingMessage,
            type: "text",
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("[MintyChat] Failed to open ticket:", err);
      } finally {
        setInitialising(false);
      }
    },
    [joinTicket, appendMessage, setTicket]
  );

  // ── Send a text message ───────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !ticket || rateLimited) return;

    const tempId = generateTempId();
    const optimistic: SupportMessage = {
      _id: tempId,
      ticketId: ticket._id,
      sender: "user",
      text,
      type: "text",
      createdAt: new Date().toISOString(),
      pending: true,
    };

    appendMessage(optimistic);
    setInputText("");

    try {
      await sendMessage(ticket._id, text);
      // Replace pending with confirmed (server will echo via socket:message)
      // The socket handler will naturally update; mark as no longer pending
      replaceOptimisticMessage(tempId, { ...optimistic, pending: false });
    } catch (err) {
      console.error("[MintyChat] Failed to send message:", err);
      // Keep the optimistic message but mark as error — simplest UX
    }
  }, [inputText, ticket, rateLimited, appendMessage, sendMessage, replaceOptimisticMessage]);

  // ── Handle Enter key ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Handle action button presses (NAVIGATE / OPEN_TAB) ───────────────────
  const handleAction = useCallback(
    (_label: string, metadata: SupportMessage["metadata"]) => {
      if (!metadata) return;

      if (metadata.action === "NAVIGATE") {
        // Web doesn't have the same native routing as the mobile app.
        // Map well-known screens to frontend routes.
        const routeMap: Record<string, string> = {
          KycVerificationScreen: "/dashboard/settings",
          SecurityScreen: "/dashboard/settings",
          FundWalletScreen: "/dashboard/add-funds",
          TransferScreen: "/dashboard/transfer",
          ReferralScreen: "/dashboard/referrals",
          SpinWheelScreen: "/dashboard/rewards",
        };
        const route = routeMap[metadata.screen ?? ""];
        if (route) {
          window.location.href = route;
        }
      } else if (metadata.action === "OPEN_TAB") {
        const tabRoutes: Record<string, string> = {
          home: "/dashboard",
          history: "/dashboard/history",
          referrals: "/dashboard/referrals",
          settings: "/dashboard/settings",
        };
        const route = tabRoutes[metadata.tab ?? ""];
        if (route) window.location.href = route;
      }
    },
    []
  );

  // ── Handle resolve feedback ───────────────────────────────────────────────
  const handleResolveFeedback = useCallback(
    async (confirmed: boolean) => {
      if (!ticket) return;
      try {
        await sendResolveFeedback(ticket._id, confirmed);
        setFeedbackDone(true);
        setAwaitingResolveFeedback(false);
      } catch (err) {
        console.error("[MintyChat] resolve feedback error:", err);
      }
    },
    [ticket, sendResolveFeedback, setAwaitingResolveFeedback]
  );

  const isClosed = ticketStatus === "closed" || ticketStatus === "resolved";
  const showWelcome = !ticket && !initialising;
  const canSend = !!ticket && !isClosed && !rateLimited;

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────────────────── */}
      <button
        id="minty-chat-trigger"
        aria-label="Open Minty support chat"
        onClick={() => setOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand text-white shadow-xl shadow-brand/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150"
        style={{ boxShadow: "0 8px 32px rgba(11,69,200,0.35)" }}
      >
        {isOpen ? (
          /* Close X */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Chat icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat drawer ─────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-48px)] h-[540px] max-h-[calc(100dvh-120px)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{
          boxShadow: "0 24px 80px rgba(11,69,200,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        }}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-brand text-white shrink-0">
          <MintyAvatar size={38} />
          <div className="flex-1 min-w-0">
            <p className="font-bold font-display text-sm leading-tight">Minty</p>
            <p className="text-xs text-white/70 truncate">
              {ticketStatus === "active"
                ? `Agent: ${useSupportStore.getState().escalationInfo?.agentName ?? "Live Agent"}`
                : ticketStatus === "queued"
                ? "Connecting to agent…"
                : "Paymint AI Assistant"}
            </p>
          </div>
          {/* Ticket number */}
          {ticket && (
            <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-mono shrink-0">
              {ticket.ticketNumber}
            </span>
          )}
          {/* Header Close Button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Escalation banner */}
        {isOpen && (
          <div className="shrink-0 pt-2">
            <EscalationBanner />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3 hide-scrollbar">
          {initialising && (
            <div className="flex justify-center items-center h-full">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-brand/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {!initialising && showWelcome && (
            <WelcomeScreen onChipSelect={handleChipSelect} loading={initialising} />
          )}

          {!initialising && !showWelcome && (
            <>
              {messages.map((msg) => (
                <Bubble
                  key={msg._id}
                  message={msg}
                  onAction={handleAction}
                  onResolveFeedback={handleResolveFeedback}
                  awaitingFeedback={awaitingResolveFeedback}
                  feedbackDone={feedbackDone}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 items-end mb-3">
                  <MintyAvatar size={28} />
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm">
                    <TypingDots />
                    {typingSender && (
                      <p className="text-[10px] text-slate px-4 pb-2 -mt-1">
                        {typingSender} is typing…
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Closed notice */}
              {isClosed && (
                <div className="flex flex-col items-center gap-2 my-4 px-3">
                  <span className="text-xs text-slate bg-gray-100 rounded-full px-4 py-1.5 font-medium">
                    This support session has ended
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      useSupportStore.getState().reset();
                      setFeedbackDone(false);
                    }}
                    className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <span>Need help with something else? Start a new chat</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Rate limit warning */}
        {rateLimited && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 text-center">
            You're sending messages too fast. Please wait a moment 🙏
          </div>
        )}

        {/* Input area */}
        <div className="shrink-0 border-t border-gray-100 px-3 py-3 flex items-end gap-2 bg-white">
          <textarea
            ref={inputRef}
            id="minty-chat-input"
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={!canSend}
            placeholder={
              isClosed
                ? "This chat is closed"
                : !ticket
                ? "Select a topic above to start"
                : rateLimited
                ? "Please wait…"
                : "Type a message…"
            }
            className="flex-1 resize-none bg-gray-50 rounded-2xl px-4 py-2.5 text-sm text-[#101928] outline-none border border-gray-200 focus:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
            style={{ maxHeight: 100 }}
          />
          <button
            id="minty-chat-send"
            onClick={handleSend}
            disabled={!inputText.trim() || !canSend}
            aria-label="Send message"
            className="w-10 h-10 shrink-0 rounded-full bg-brand text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default MintyChat;
