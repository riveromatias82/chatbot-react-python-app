import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

const ChatContainer = ({ messages, isTyping = false, currentResponse = '' }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, currentResponse]);

  return (
    <div className="flex-1 overflow-y-auto chat-container p-4 space-y-4">
      {messages.length === 0 && !isTyping ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium mb-2">Welcome to ChatGPT Chat!</h3>
            <p className="text-sm">
              Start a conversation by typing a message below.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.content}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
          
          {isTyping && (
            <ChatMessage
              message={currentResponse}
              isUser={false}
              isTyping={true}
            />
          )}
        </>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer; 