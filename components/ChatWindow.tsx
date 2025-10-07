import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onActivateVoiceMode: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onActivateVoiceMode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} onRecord={onActivateVoiceMode} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
           <div className="max-w-xl px-4 py-3 rounded-2xl shadow-md bg-white text-gray-800 rounded-bl-none">
            <LoadingIndicator />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
