import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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

export const useTransactionSocket = (reference: string | null) => {
  const [status, setStatus] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    if (!reference) return;

    const token = localStorage.getItem("accessToken");
    const socket: Socket = io(getSocketUrl(), {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log(`Connected to transaction socket with ID: ${socket.id}`);
      socket.emit("subscribe:transaction", reference);
    });

    socket.on("transaction_update", (data) => {
      console.log("Transaction update received:", data);
      if (data && data.status) {
        setStatus(data.status);
        setTransactionData(data.transaction);
      }
    });

    return () => {
      socket.emit("unsubscribe:transaction", reference);
      socket.off("transaction_update");
      socket.disconnect();
    };
  }, [reference]);

  return { status, transactionData };
};
