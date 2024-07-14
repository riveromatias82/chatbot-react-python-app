import React, { useState, useCallback } from 'react';

const ChatInput = ({ onSendMessage, isConnected, hasEverConnected, isLoading = false }) => {
  const [message, setMessage] = useState('');

  const validateMessage = useCallback((text) => {
    const trimmed = text.trim();
    return trimmed.length > 0 && trimmed.length <= 1000;
  }, []);

  const isValid = validateMessage(message);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!isValid || !isConnected || isLoading) {
      return;
    }

    const trimmedMessage = message.trim();
    onSendMessage(trimmedMessage);
    setMessage('');
  }, [isValid, isConnected, isLoading, message, onSendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleTextareaChange = useCallback((e) => {
    const value = e.target.value;
    setMessage(value);
  }, []);

  const handleClear = useCallback(() => {
    setMessage('');
  }, []);

  const isDisabled = !isConnected || isLoading || !isValid;

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex flex-col gap-2">
        <div className="flex-1 relative flex flex-col justify-start">
          <textarea
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            className="w-full px-4 py-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[64px] max-h-[140px]"
            disabled={!isConnected || isLoading}
            maxLength={1000}
          />
          <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
            {message.length}/1000
          </div>
        </div>
        <div className="flex flex-row justify-end">
          <button
            type="button"
            onClick={handleClear}
            className={`px-4 py-2 min-w-[80px] text-base rounded-lg text-gray-500 hover:text-gray-700 transition-colors font-medium ${message ? '' : 'invisible'}`}
            disabled={!isConnected || isLoading}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isDisabled}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-w-[80px] text-base ${
              isDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
      {!isConnected && hasEverConnected && (
        <div className="mt-2 text-sm text-red-600">
          Not connected to server. Please wait for connection...
        </div>
      )}
    </form>
  );
};

export default ChatInput; 