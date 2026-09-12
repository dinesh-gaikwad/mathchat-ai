import React from "react";

export default function TypingIndicator({ visible }) {
  if (!visible) return null;
  return (
    <div className="typing-indicator">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  );
}
