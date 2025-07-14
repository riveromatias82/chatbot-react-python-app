import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '../ChatInput';
import { act } from 'react';

// Increase timeout for tests
jest.setTimeout(10000);

describe('ChatInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  test('renders input field and send button', () => {
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('shows character count', () => {
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  test('updates character count when typing', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    await act(async () => {
      await user.type(input, 'Hello');
    });

    expect(screen.getByText('5/1000')).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await act(async () => {
      await user.type(input, 'Hello world');
    });

    await act(async () => {
      await user.click(sendButton);
    });

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
    });
  });

  test('sends message when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    
    await act(async () => {
      await user.type(input, 'Hello world');
    });

    await act(async () => {
      await user.keyboard('{Enter}');
    });

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
    });
  });

  test('does not send message when Shift+Enter is pressed', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    await act(async () => {
      await user.type(input, 'Hello world');
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  test('does not send empty message', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    await act(async () => {
      await user.click(sendButton);
    });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  test('does not send message when disconnected', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={false}
        hasEverConnected={true}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await act(async () => {
      await user.type(input, 'Hello world');
      await user.click(sendButton);
    });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
    expect(screen.getByText(/not connected/i)).toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
        isLoading={true}
      />
    );

    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  test('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    await act(async () => {
      await user.type(input, 'Hello world');
    });

    expect(input.value).toBe('Hello world');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await act(async () => {
      await user.click(clearButton);
    });

    expect(input.value).toBe('');
  });

  test('does not show clear button when input is empty', () => {
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toHaveClass('invisible');
  });

  test('disables send button when message is too long', async () => {
    const user = userEvent.setup();
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage}
        isConnected={true}
        hasEverConnected={true}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    
    // Set the value directly to avoid typing delays
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a'.repeat(1001) } });
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
}); 