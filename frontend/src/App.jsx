import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { listSessions, createSession, deleteSession } from "./services/api";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const refreshSessions = async () => {
    try {
      const data = await listSessions();
      setSessions(data);
      if (!activeId && data.length > 0) setActiveId(data[0].id);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  useEffect(() => {
    refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      const session = await createSession("New Math Chat");
      setSessions((prev) => [session, ...prev]);
      setActiveId(session.id);
    } catch (e) {
      // Fallback: create a client-side session id; backend auto-creates on join_session
      const localId = uuidv4();
      setSessions((prev) => [{ id: localId, title: "New Math Chat" }, ...prev]);
      setActiveId(localId);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSession(id);
    } catch (e) {
      // ignore - still remove locally
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="app-shell">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
      <ChatWindow sessionId={activeId} />
    </div>
  );
}
