import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '@/components/chatInterface';

// Mock the useTasks hook
jest.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [],
    addNewTask: jest.fn(),
    updateTask: jest.fn(),
    removeTask: jest.fn(),
  }),
}));

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'AI response', suggestedTask: 'Suggested task' }),
  })
) as jest.Mock;

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ChatInterface component', () => {
    render(<ChatInterface />);
    expect(screen.getByText('Chat with AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  test('displays welcome message on initial render', () => {
    render(<ChatInterface />);
    expect(screen.getByText("Hello! I'm your AI assistant. How can I help you manage your tasks today?")).toBeInTheDocument();
  });

  test('sends user message and receives AI response', async () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'Hello AI' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello AI')).toBeInTheDocument();
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.any(Object));
  });

  test('displays quick options and allows selection', () => {
    render(<ChatInterface />);
    const quickOptions = ['Get a haircut', 'Buy groceries', 'Schedule dentist appointment'];

    quickOptions.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Buy groceries'));
    expect(screen.getByPlaceholderText('Type your message...')).toHaveValue('Buy groceries');
  });

  // Add more tests for task operations (add, update, remove) if needed
});