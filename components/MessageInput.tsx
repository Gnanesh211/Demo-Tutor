import React, { forwardRef } from 'react';
import SendIcon from './icons/SendIcon';

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isVoiceMode: boolean;
}

const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(({ input, setInput, onSendMessage, isLoading, isVoiceMode }, ref) => {
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
    }
  };

  return (
    <div className="bg-gray-100 p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit} className={`flex items-center bg-white rounded-full shadow-md px-2 py-1 transition-all ${isVoiceMode ? 'ring-2 ring-blue-500' : ''}`}>
        <textarea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder={isVoiceMode ? "Type your spoken response..." : "Type your message here..."}
          className="flex-1 p-2 bg-transparent border-none focus:outline-none resize-none"
          rows={1}
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
});

export default MessageInput;
