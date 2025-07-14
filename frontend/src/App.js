import React, { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket from './hooks/useWebSocket';
import ConnectionStatus from './components/ConnectionStatus';
import ChatContainer from './components/ChatContainer';
import ChatInput from './components/ChatInput';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const currentResponseRef = useRef('');
  const [conversationId] = useState(`conv-${Date.now()}`);

  // Keep ref in sync with state
  useEffect(() => {
    currentResponseRef.current = currentResponse;
  }, [currentResponse]);

  // WebSocket connection
  const wsUrl = `ws://${window.location.hostname}:8000/ws/chat`;

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'message': {
          const chunk = data.data.content || '';
          const isQuotaError = chunk.includes('You exceeded your current quota');
          if (isQuotaError) {
            setIsTyping(false);
            setCurrentResponse('');
            setMessages(prev => [
              ...prev,
              {
                content: '🚫 You have exceeded your current OpenAI API quota.',
                isUser: false,
                timestamp: new Date().toISOString(),
                isError: true,
                isQuotaError: true
              }
            ]);
            break;
          }
          if (data.data.is_complete) {
            if (currentResponseRef.current.trim()) {
              setMessages(prev => [...prev, {
                content: currentResponseRef.current,
                isUser: false,
                timestamp: data.data.timestamp || new Date().toISOString()
              }]);
            }
            setCurrentResponse('');
            setIsTyping(false);
          } else {
            setCurrentResponse(prev => prev + chunk);
            setIsTyping(true);
          }
          break;
        }
        case 'error': {
          console.log('Error:', data.data.message);
          setIsTyping(false);
          setCurrentResponse('');
          setMessages(prev => [...prev, {
            content: `Error: ${data.data.message}`,
            isUser: false,
            timestamp: new Date().toISOString(),
            isError: true
          }]);
          break;
        }
        case 'status':
          console.log('Status update:', data.data);
          break;
        case 'pong':
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  const { isConnected, isConnecting, error, sendMessage, connect, disconnect, hasEverConnected } = useWebSocket(wsUrl, handleMessage);

  // Send message to server
  const handleSendMessage = useCallback((messageText) => {
    if (!isConnected || !messageText.trim()) {
      return;
    }
    const userMessage = {
      content: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setCurrentResponse('');
    const success = sendMessage({
      type: 'message',
      message: messageText,
      conversation_id: conversationId
    });
    if (!success) {
      console.error('Failed to send message');
      setIsTyping(false);
    }
  }, [isConnected, sendMessage, conversationId]);

  const handleClearChat = () => {
    setMessages([]);
    setCurrentResponse('');
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30 px-2">
        <div className="max-w-4xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-3 justify-start">
            <div className="text-2xl">🤖</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 max-w-[120px] break-words sm:max-w-none">ChatGPT WebSocket Chat</h1>
              <p className="text-sm text-gray-500">Real-time AI conversations</p>
            </div>
          </div>
          <div className="flex flex-col xl:flex-row xl:items-center xl:space-x-4 space-y-2 xl:space-y-0 w-full xl:w-auto items-center justify-center sm:justify-end">
            <ConnectionStatus 
              isConnected={isConnected}
              isConnecting={isConnecting}
              error={error}
              hasEverConnected={hasEverConnected}
            />
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors w-full xs:w-auto"
              >
                Clear Chat
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white shadow-lg">
        <ChatContainer 
          messages={messages}
          isTyping={isTyping}
          currentResponse={currentResponse}
        />
        {/* Show general error at the bottom of chat */}
        {messages.some(message => message.isError) && (
          <div className="text-center text-red-600 font-semibold p-4">
            🚫 There was a problem processing your message. Please try again later or contact support.
          </div>
        )}
        <ChatInput
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
          isLoading={isTyping}
          hasEverConnected={hasEverConnected}
        />
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 py-4 shadow-inner sticky bottom-0 z-30 px-2">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            Powered by OpenAI ChatGPT API • Real-time WebSocket communication
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App; 