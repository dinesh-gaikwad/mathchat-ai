import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}

export function joinSession(sessionId, title) {
  getSocket().emit("join_session", { session_id: sessionId, title });
}

export function leaveSession(sessionId) {
  getSocket().emit("leave_session", { session_id: sessionId });
}

export function sendMathQuery(sessionId, message) {
  getSocket().emit("math_query", { session_id: sessionId, message });
}

export function sendTyping(sessionId) {
  getSocket().emit("typing", { session_id: sessionId });
}
