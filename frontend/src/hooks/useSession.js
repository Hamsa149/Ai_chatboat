import { useState, useEffect } from 'react';

export function useSession() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Try to get session ID from localStorage
    const savedSessionId = localStorage.getItem('chatbotSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  const createNewSession = () => {
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    localStorage.setItem('chatbotSessionId', newSessionId);
    return newSessionId;
  };

  const clearSession = () => {
    setSessionId(null);
    localStorage.removeItem('chatbotSessionId');
  };

  return {
    sessionId,
    createNewSession,
    clearSession
  };
}