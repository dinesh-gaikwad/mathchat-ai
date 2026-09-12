import React, { useState } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function MessageBubble({ message }) {
  const [showSteps, setShowSteps] = useState(false);
  const isUser = message.role === "user";
  let steps = [];
  try {
    steps = message.steps ? JSON.parse(message.steps) : [];
  } catch (e) {
    steps = [];
  }

  return (
    <div className={`bubble-row ${isUser ? "bubble-row-user" : "bubble-row-assistant"}`}>
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}>
        <div className="bubble-content">{message.content}</div>

        {message.latex && (
          <div className="bubble-latex">
            <BlockMath math={message.latex} errorColor="#cc0000" />
          </div>
        )}

        {steps.length > 0 && (
          <div className="bubble-steps">
            <button className="steps-toggle" onClick={() => setShowSteps((s) => !s)}>
              {showSteps ? "Hide steps ▲" : `Show ${steps.length} steps ▼`}
            </button>
            {showSteps && (
              <ol className="steps-list">
                {steps.map((step, idx) => (
                  <li key={idx}>
                    <span>{step.text}</span>
                    {step.latex && <BlockMath math={step.latex} errorColor="#cc0000" />}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
