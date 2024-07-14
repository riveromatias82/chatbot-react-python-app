import React from 'react';

const ChatMessage = ({ message, isUser, timestamp, isTyping = false }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  if (isTyping) {
    return (
      <div className="flex justify-start mb-4">
        <div className="chat-message assistant-message">
          <div className="whitespace-pre-wrap break-words">
            {message}
            <span className="inline-block align-middle ml-1">
              <span className="typing-indicator">
                <span className="typing-dot" style={{ animationDelay: '0ms' }}></span>
                <span className="typing-dot" style={{ animationDelay: '150ms' }}></span>
                <span className="typing-dot" style={{ animationDelay: '300ms' }}></span>
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
        <div className="whitespace-pre-wrap break-words">
          {message}
        </div>
        {timestamp && (
          <div className={`text-xs mt-2 ${isUser ? 'text-primary-100' : 'text-gray-500'}`}>
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 