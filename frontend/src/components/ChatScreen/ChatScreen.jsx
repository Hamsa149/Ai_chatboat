import React, { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Header from "../common/Header";
import ChatHistory from "./ChatHistory"; 
import { useChatActions } from "../../hooks/useChat";
import { chatAPI } from "../../services/api";
import "./ChatScreen.scss";

const ChatScreen = () => {
  const {
    messages,
    isLoading,
    clearChat,
    sessionId,
    getSessions,
    switchSession,
    dispatch
  } = useChatActions();

  const [sessions, setSessions] = useState([]);

  // Fetch all sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await getSessions(); 
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }
    fetchSessions();
  }, [sessionId, getSessions]);

  // Clear selected session
  const clearCurrentSession = async (id) => {
    if (!id) return;
    try {
      await chatAPI.clearHistory(id); // Clear session on server
      setSessions((prev) => prev.filter((s) => s.session_id !== id)); // Remove from state
      if (id === sessionId) {
        dispatch({ type: "CLEAR_MESSAGES" }); // Clear messages if current session
      }
    } catch (err) {
      console.error("Failed to clear session:", err);
    }
  };

  return (
    <div className="chat-layout">
      {/* ✅ Left Side Chat History */}
      <ChatHistory
        sessions={sessions}
        onSelect={switchSession}
        currentSessionId={sessionId}
        onClearCurrent={clearCurrentSession} // Pass clear function
      />

      {/* ✅ Right Side Chat Screen */}
      <div className="chat-screen">
        <Header
          title="News Chatbot"
          onReset={clearChat}
          sessionId={sessionId}
        />

        <MessageList messages={messages} isLoading={isLoading} />

        <MessageInput disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatScreen;
