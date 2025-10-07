import React from 'react';

interface TranscriptionCardProps {
  userInput: string;
  modelOutput: string;
}

const TranscriptionCard: React.FC<TranscriptionCardProps> = ({ userInput, modelOutput }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-3">
      <div>
        <p className="text-sm font-semibold text-blue-600">You</p>
        <p className="text-gray-700">{userInput || '...'}</p>
      </div>
      <hr />
      <div>
        <p className="text-sm font-semibold text-green-600">Toby AI</p>
        <p className="text-gray-700">{modelOutput || '...'}</p>
      </div>
    </div>
  );
};

export default TranscriptionCard;
