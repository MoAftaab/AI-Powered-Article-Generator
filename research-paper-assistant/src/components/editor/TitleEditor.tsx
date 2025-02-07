import React from 'react';

interface TitleEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
}

const TitleEditor: React.FC<TitleEditorProps> = ({ title, onTitleChange }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Paper Title</h2>
      </div>
      <div className="p-6">
        <textarea
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter your paper title..."
          className="w-full p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-serif text-lg"
          rows={2}
        />
      </div>
    </div>
  );
};

export default TitleEditor;