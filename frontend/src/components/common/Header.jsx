import React from 'react';
import Button from './Button';
import './Header.scss';

const Header = ({ title, onReset, sessionId }) => {
  return (
    <header className="chat-header">
      <div className="header-content">
        <h1>{title}</h1>
        <div className="header-actions">
          {sessionId && (
            <span className="session-id">Session: {sessionId.substring(0, 8)}...</span>
          )}
          <Button onClick={onReset} variant="secondary">
            New Chat
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;