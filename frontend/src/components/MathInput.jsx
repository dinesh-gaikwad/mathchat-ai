import React, { useState, useRef } from "react";

const QUICK_INSERTS = [
  { label: "√", value: "sqrt()" },
  { label: "π", value: "pi" },
  { label: "^", value: "^" },
  { label: "∫", value: "integrate " },
  { label: "d/dx", value: "differentiate " },
  { label: "lim", value: "limit " },
];

export default function MathInput({ onSend, onTyping, disabled }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    onTyping && onTyping();
  };

  const insertToken = (token) => {
    setValue((v) => `${v}${token}`);
    inputRef.current && inputRef.current.focus();
  };

  return (
    <form className="math-input-form" onSubmit={handleSubmit}>
      <div className="quick-inserts">
        {QUICK_INSERTS.map((qi) => (
          <button
            type="button"
            key={qi.label}
            className="quick-insert-btn"
            onClick={() => insertToken(qi.value)}
          >
            {qi.label}
          </button>
        ))}
      </div>
      <div className="input-row">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="e.g. solve 2x^2 - 8 = 0, or differentiate sin(x)*x^2"
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !value.trim()}>
          Send
        </button>
      </div>
    </form>
  );
}
