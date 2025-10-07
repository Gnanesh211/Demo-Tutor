
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 animate-pulse">
      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animation-delay-200"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animation-delay-400"></div>
      <span className="text-sm text-gray-500">Toby is typing...</span>
    </div>
  );
};

export default LoadingIndicator;
