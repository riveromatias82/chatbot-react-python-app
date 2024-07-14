import React from 'react';
import { render, screen } from '@testing-library/react';
import ConnectionStatus from '../ConnectionStatus';

describe('ConnectionStatus', () => {
  test('shows connected status when isConnected is true', () => {
    render(
      <ConnectionStatus 
        isConnected={true}
        isConnecting={false}
        error={null}
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('🟢')).toBeInTheDocument();
    expect(screen.getByText('Connected').closest('div')).toHaveClass('status-connected');
  });

  test('shows connecting status when isConnecting is true', () => {
    render(
      <ConnectionStatus 
        isConnected={false}
        isConnecting={true}
        error={null}
        hasEverConnected={false}
      />
    );

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    expect(screen.getByText('🟡')).toBeInTheDocument();
    expect(screen.getByText('Connecting...').closest('div')).toHaveClass('status-connecting');
  });

  test('shows disconnected status when there is an error', () => {
    render(
      <ConnectionStatus 
        isConnected={false}
        isConnecting={false}
        error="Connection failed"
        hasEverConnected={false}
      />
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
    expect(screen.getByText('Disconnected').closest('div')).toHaveClass('status-disconnected');
  });

  test('shows disconnected status when not connected and not connecting', () => {
    render(
      <ConnectionStatus 
        isConnected={false}
        isConnecting={false}
        error={null}
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
    expect(screen.getByText('Disconnected').closest('div')).toHaveClass('status-disconnected');
  });

  test('prioritizes error over connecting status', () => {
    render(
      <ConnectionStatus 
        isConnected={false}
        isConnecting={true}
        error="Connection failed"
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
    expect(screen.getByText('Disconnected').closest('div')).toHaveClass('status-disconnected');
  });

  test('prioritizes connecting over connected status', () => {
    render(
      <ConnectionStatus 
        isConnected={true}
        isConnecting={true}
        error={null}
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    expect(screen.getByText('🟡')).toBeInTheDocument();
    expect(screen.getByText('Connecting...').closest('div')).toHaveClass('status-connecting');
  });

  test('has correct CSS classes for different states', () => {
    const { rerender } = render(
      <ConnectionStatus 
        isConnected={true}
        isConnecting={false}
        error={null}
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('Connected').closest('div')).toHaveClass('connection-status', 'status-connected');

    rerender(
      <ConnectionStatus 
        isConnected={false}
        isConnecting={true}
        error={null}
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('Connecting...').closest('div')).toHaveClass('connection-status', 'status-connecting');

    rerender(
      <ConnectionStatus 
        isConnected={false}
        isConnecting={false}
        error="Error"
        hasEverConnected={true}
      />
    );

    expect(screen.getByText('Disconnected').closest('div')).toHaveClass('connection-status', 'status-disconnected');
  });
}); 