// frontend/src/hooks/useChatActions.js
import { useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';
import { chatAPI } from '../services/api';

export function useChatActions() {
  const { state, dispatch } = useChat();

  // ✅ Send Message
  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim()) return;

      const userMessage = {
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      // Add user message to state
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await chatAPI.sendMessage(messageText, state.sessionId);

        if (!response || !response.response) {
          throw new Error('No response from server');
        }

        const assistantMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
        };

        // ✅ Add assistant message first
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

        // ✅ Update session if backend returned a new one
        if (!state.sessionId && response.sessionId) {
          dispatch({ type: 'SET_SESSION', payload: response.sessionId });
        }
      } catch (error) {
        console.error('Chat error:', error.message);

        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true,
        };

        // ✅ Only show error if no assistant message yet
        const hasAssistantMessage = state.messages.some(m => m.role === 'assistant');
        if (!hasAssistantMessage) {
          dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.sessionId, state.messages, dispatch]
  );

  // ✅ Clear chat history
  const clearChat = useCallback(async () => {
    if (state.sessionId) {
      try {
        await chatAPI.clearHistory(state.sessionId);
      } catch (error) {
        console.error('Failed to clear history on server:', error);
      }
    }
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, [state.sessionId, dispatch]);

  // ✅ Load chat history for a session
  const loadHistory = useCallback(
    async (sessionId) => {
      try {
        const response = await chatAPI.getHistory(sessionId);
        dispatch({ type: 'LOAD_HISTORY', payload: response.history });
        dispatch({ type: 'SET_SESSION', payload: sessionId });
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    },
    [dispatch]
  );

  // ✅ Fetch all sessions
  const getSessions = useCallback(async () => {
    try {
      const data = await chatAPI.getSessions();
      return data;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }
  }, []);

  // ✅ Switch session
  const switchSession = useCallback(
    (sessionId) => {
      dispatch({ type: 'SET_SESSION', payload: sessionId });
      loadHistory(sessionId);
    },
    [dispatch, loadHistory]
  );

  return {
    sendMessage,
    clearChat,
    loadHistory,
    getSessions,
    switchSession,
    messages: state.messages,
    sessionId: state.sessionId,
    isLoading: state.isLoading,
    error: state.error,
  };
}
