import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Assuming baseURL is https://js.billpadi.com/api/v1
// The socket URL should be the origin.
const SOCKET_URL = "https://js.billpadi.com";

export const useTransactionSocket = (reference: string | null) => {
  const [status, setStatus] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    if (!reference) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log(`Connected to socket with ID: ${socket.id}`);
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
      socket.disconnect();
    };
  }, [reference]);

  return { status, transactionData };
};
