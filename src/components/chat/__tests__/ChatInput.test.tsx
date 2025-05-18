import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '@/components/chat/ChatInput';

describe('ChatInput Component', () => {
  const mockSendMessage = jest.fn();

  beforeEach(() => {
    mockSendMessage.mockClear();
  });

  it('renders correctly', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    expect(
      screen.getByPlaceholderText('Type your message...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello AI' } });

    expect(input).toHaveValue('Hello AI');
  });

  it('calls onSendMessage when form is submitted', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello AI' } });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSendMessage).toHaveBeenCalledWith('Hello AI');
    expect(input).toHaveValue('');
  });

  it('does not call onSendMessage when input is empty', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('disables input and button when disabled prop is true', () => {
    render(<ChatInput onSendMessage={mockSendMessage} disabled={true} />);

    expect(screen.getByPlaceholderText('Type your message...')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
