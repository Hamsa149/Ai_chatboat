import React from "react";
import "./ChatHistory.scss";

const ChatHistory = ({ sessions, onSelect, currentSessionId, onClearCurrent }) => {
  return (
    <div className="chat-history">
      <h3>Chat History</h3>

      {/* Clear button for selected session */}
      {currentSessionId && (
        <button className="clear-history-btn" onClick={() => onClearCurrent(currentSessionId)}>
          Clear Selected History
        </button>
      )}

      {sessions.length === 0 ? (
        <p className="empty">No chats yet</p>
      ) : (
        <ul>
          {sessions.map((s) => (
            <li
              key={s.session_id}
              className={s.session_id === currentSessionId ? "active" : ""}
              onClick={() => onSelect(s.session_id)}
            >
              🗨️ {s.title || `Session ${s.session_id.slice(0, 6)}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
