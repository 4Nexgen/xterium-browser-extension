import { io } from "socket.io-client";

const SOCKET_URL = "https://api.paydon.io/prices";

export const initializeSocket = () => {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
  });

  return socket;
};
