import React from 'react';
import ChatScreen from './components/ChatScreen/ChatScreen';
import { ChatProvider } from './contexts/ChatContext';


function App() {
  return (
    <div className="App">
      <ChatProvider>
        <ChatScreen />
      </ChatProvider>
    </div>
  );
}

export default App;