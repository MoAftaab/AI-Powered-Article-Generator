import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import type { SectionEditorProps } from '../../types/common';
import ProgressBar from './ProgressBar';

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isRegenerating,
  progress,
  prompt,
  onPromptChange,
  onRegenerate,
  onContentChange,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
        {isRegenerating && (
          <div className="mt-2">
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>
      <div className="p-6">
        <textarea
          value={section.content}
          onChange={(e) => onContentChange(e.target.value)}
          disabled={isRegenerating}
          rows={10}
          className={`w-full p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
            isRegenerating ? 'bg-gray-50' : ''
          }`}
        />
        <div className="mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder="Enter requirements to regenerate this section..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
            <button
              onClick={onRegenerate}
              disabled={isRegenerating || !prompt.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionEditor;
