// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configure testing environment to use React 18's act
import { configure } from '@testing-library/react';

// Configure React Testing Library to use React 18's act
configure({ asyncUtilTimeout: 5000 });

// Mock WebSocket for tests
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }
  
  send(data) {
    // Mock send functionality
  }
  
  close(code, reason) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose({ code, reason });
  }
};

// Set WebSocket constants
WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3; 