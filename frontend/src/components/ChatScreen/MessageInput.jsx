import React, { useState } from 'react';
import { useChatActions } from '../../hooks/useChat';
import Button from '../common/Button';
import './MessageInput.scss';

const MessageInput = ({ disabled }) => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChatActions();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about recent news..."
            disabled={disabled}
            className="message-input"
          />
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="send-button"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;