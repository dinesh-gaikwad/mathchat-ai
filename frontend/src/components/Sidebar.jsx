import React from "react";

export default function Sidebar({ sessions, activeId, onSelect, onCreate, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>MathChat AI</h2>
        <button className="new-chat-btn" onClick={onCreate}>+ New Chat</button>
      </div>
      <ul className="session-list">
        {sessions.map((s) => (
          <li
            key={s.id}
            className={`session-item ${s.id === activeId ? "session-item-active" : ""}`}
          >
            <button className="session-select" onClick={() => onSelect(s.id)}>
              {s.title || "Untitled chat"}
            </button>
            <button className="session-delete" onClick={() => onDelete(s.id)}>
              ✕
            </button>
          </li>
        ))}
        {sessions.length === 0 && (
          <li className="session-empty">No chats yet — start one!</li>
        )}
      </ul>
    </aside>
  );
}
