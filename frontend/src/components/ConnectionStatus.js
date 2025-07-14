import React from 'react';

const ConnectionStatus = ({ isConnected, isConnecting, error, hasEverConnected }) => {
  const getStatusInfo = () => {
    if (error) {
      return {
        text: 'Disconnected',
        className: 'status-disconnected',
        icon: '🔴'
      };
    }
    if (isConnecting) {
      return {
        text: 'Connecting...',
        className: 'status-connecting',
        icon: '🟡'
      };
    }
    if (isConnected) {
      return {
        text: 'Connected',
        className: 'status-connected',
        icon: '🟢'
      };
    }
    if (!isConnected && !isConnecting && hasEverConnected) {
      return {
        text: 'Disconnected',
        className: 'status-disconnected',
        icon: '🔴'
      };
    }
    // Initial load, still trying
    return {
      text: 'Connecting...',
      className: 'status-connecting',
      icon: '🟡'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`connection-status ${statusInfo.className}`}>
      <span className="mr-2">{statusInfo.icon}</span>
      {statusInfo.text}
    </div>
  );
};

export default ConnectionStatus; 