import React from 'react';
import type { ProgressBarProps } from '../../types/common';

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-600 text-right">{progress}%</p>
    </div>
  );
};

export default ProgressBar;
