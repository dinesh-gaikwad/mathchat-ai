import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import MathInput from "./MathInput";
import TypingIndicator from "./TypingIndicator";
import { getSocket, joinSession, leaveSession, sendMathQuery, sendTyping } from "../services/socket";

export default function ChatWindow({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [peerTyping, setPeerTyping] = useState(false);
  const [waitingForReply, setWaitingForReply] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();
    joinSession(sessionId);

    const handleHistory = (data) => {
      if (data.session_id === sessionId) setMessages(data.messages || []);
    };
    const handleMessage = (msg) => {
      if (msg.session_id === sessionId) {
        setMessages((prev) => [...prev, msg]);
        if (msg.role === "assistant") setWaitingForReply(false);
      }
    };
    const handlePeerTyping = (data) => {
      if (data.session_id === sessionId) {
        setPeerTyping(true);
        setTimeout(() => setPeerTyping(false), 2000);
      }
    };

    socket.on("session_history", handleHistory);
    socket.on("message_received", handleMessage);
    socket.on("peer_typing", handlePeerTyping);

    return () => {
      socket.off("session_history", handleHistory);
      socket.off("message_received", handleMessage);
      socket.off("peer_typing", handlePeerTyping);
      leaveSession(sessionId);
    };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    setWaitingForReply(true);
    sendMathQuery(sessionId, text);
  };

  const handleTyping = () => {
    sendTyping(sessionId);
  };

  if (!sessionId) {
    return (
      <div className="chat-window chat-window-empty">
        <p>Select or start a new chat to begin solving math problems live.</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages-pane">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {(peerTyping || waitingForReply) && <TypingIndicator visible />}
        <div ref={bottomRef} />
      </div>
      <MathInput onSend={handleSend} onTyping={handleTyping} disabled={waitingForReply} />
    </div>
  );
}
