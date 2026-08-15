import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface WalletBalanceEventPayload {
  balance: number;
  bonusBalance: number;
  commissionBalance: number;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  type: string;
  reference: string;
  reason?: string;
  timestamp: string;
}

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

export const useWalletSocket = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Prevent duplicate connections if socket is already initialized
    if (socketRef.current) {
      return;
    }

    const socketUrl = getSocketUrl();
    const socket: Socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Real-time Wallet Socket connected:", socket.id);
    });

    // 1. Handle Real-Time Wallet Credit (Deposit, Refund, Admin Credit, Reversal, P2P Received)
    socket.on("wallet_credit", (payload: WalletBalanceEventPayload) => {
      console.log("💰 [Socket] Wallet Credited:", payload);

      // Optimistically update React Query cache for wallet balance without full re-fetch loop
      queryClient.setQueryData(["wallet-balance"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          balance: payload.balance,
          bonusBalance: payload.bonusBalance ?? oldData.bonusBalance,
          commissionBalance:
            payload.commissionBalance ?? oldData.commissionBalance,
        };
      });

      // Invalidate transaction history so list updates
      queryClient.invalidateQueries({ queryKey: ["txn-history"] });

      const formattedAmount = Number(payload.amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      toast.success(`Wallet Credited: ₦${formattedAmount}`, {
        description: payload.reason || `Ref: ${payload.reference}`,
        duration: 6000,
      });
    });

    // 2. Handle Real-Time Wallet Debit (Withdrawal, Bill Payment, P2P Sent, Admin Debit)
    socket.on("wallet_debit", (payload: WalletBalanceEventPayload) => {
      console.log("💸 [Socket] Wallet Debited:", payload);

      // Optimistically update React Query cache for wallet balance without full re-fetch loop
      queryClient.setQueryData(["wallet-balance"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          balance: payload.balance,
          bonusBalance: payload.bonusBalance ?? oldData.bonusBalance,
          commissionBalance:
            payload.commissionBalance ?? oldData.commissionBalance,
        };
      });

      // Invalidate transaction history so list updates
      queryClient.invalidateQueries({ queryKey: ["txn-history"] });

      const formattedAmount = Number(payload.amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      toast.info(`Wallet Debited: ₦${formattedAmount}`, {
        description: payload.reason || `Ref: ${payload.reference}`,
        duration: 5000,
      });
    });

    socket.on("connect_error", (error) => {
      console.warn("⚠️ Wallet Socket connection error:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("wallet_credit");
      socket.off("wallet_debit");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, queryClient]);

  return socketRef.current;
};
