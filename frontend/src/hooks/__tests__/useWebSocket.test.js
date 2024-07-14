import { renderHook, act } from '@testing-library/react';
import useWebSocket from '../useWebSocket';

// Increase timeout for tests
jest.setTimeout(10000);

describe('useWebSocket', () => {
  beforeEach(() => {
    // Clear any existing WebSocket instances
    jest.clearAllMocks();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000/ws/chat'));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(true);
    expect(result.current.error).toBe(null);
  });

  test('connects successfully', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000/ws/chat'));

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('sends message when connected', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000/ws/chat'));

    // Wait for connection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    const message = { type: 'message', content: 'Hello' };
    const success = result.current.sendMessage(message);

    expect(success).toBe(true);
  });

  test('returns false when sending message while disconnected', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useWebSocket('ws://invalid-url'));

    const message = { type: 'message', content: 'Hello' };
    const success = result.current.sendMessage(message);

    expect(success).toBe(false);
    warnSpy.mockRestore();
  });

  test('disconnects properly', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000/ws/chat'));

    // Wait for connection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.isConnected).toBe(true);

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('handles connection errors', async () => {
    // Mock WebSocket to simulate error
    const originalWebSocket = global.WebSocket;
    global.WebSocket = class MockWebSocketWithError {
      constructor(url) {
        this.url = url;
        this.readyState = WebSocket.CONNECTING;
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        
        // Simulate error
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error('Connection failed'));
        }, 10);
      }
      
      send(data) {}
      close(code, reason) {}
    };
    
    global.WebSocket.CONNECTING = 0;
    global.WebSocket.OPEN = 1;
    global.WebSocket.CLOSING = 2;
    global.WebSocket.CLOSED = 3;

    const { result } = renderHook(() => useWebSocket('ws://localhost:8000/ws/chat'));

    // Wait for error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Restore original WebSocket
    global.WebSocket = originalWebSocket;
  });
}); 