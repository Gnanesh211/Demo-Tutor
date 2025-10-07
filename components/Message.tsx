import React from 'react';
import { ChatMessage, MessageRole } from '../types';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface MessageProps {
  message: ChatMessage;
  onRecord?: () => void;
}

const Message: React.FC<MessageProps> = ({ message, onRecord }) => {
  const isUser = message.role === MessageRole.USER;
  const isPronunciation = !isUser && /pronounced as \/.*\//.test(message.text);

  // Basic markdown processing for bold and italics
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
        <div
          className={`max-w-xl px-4 py-3 rounded-2xl shadow-md ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />
        </div>
      </div>
      {isPronunciation && onRecord && (
        <button
          onClick={onRecord}
          className="mt-2 flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
          aria-label="Record spoken response"
        >
          <MicrophoneIcon className="w-4 h-4" />
          <span>Record Response</span>
        </button>
      )}
    </div>
  );
};

export default Message;
