import { useEffect, useRef, useState } from "react";
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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!reference) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setStatus(null);
      setTransactionData(null);
      return;
    }

    // Disconnect previous socket instance if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token = localStorage.getItem("accessToken");
    const socket: Socket = io(getSocketUrl(), {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

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
      if (socketRef.current) {
        socketRef.current.emit("unsubscribe:transaction", reference);
        socketRef.current.off("transaction_update");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [reference]);

  return { status, transactionData };
};
