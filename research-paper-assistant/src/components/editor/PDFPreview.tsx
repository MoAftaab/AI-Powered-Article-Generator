import React from 'react';
import { Document, Page } from 'react-pdf';
import type { PDFPreviewProps } from '../../types/common';

const PDFPreview: React.FC<PDFPreviewProps> = ({
  pdfUrl,
  currentPage,
  numPages,
  onPageChange,
  onDownload
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="text-lg font-semibold text-gray-900">PDF Preview</h2>
      </div>
      <div className="p-6 overflow-auto max-h-[calc(100vh-350px)]">
        {pdfUrl ? (
          <div className="flex flex-col">
            <div className="bg-gray-50 rounded-lg p-4 flex-1 flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => onPageChange(1, numPages)}
                className="mx-auto"
              >
                <Page
                  pageNumber={currentPage}
                  width={550}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg bg-white"
                />
              </Document>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1), numPages)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(numPages, currentPage + 1), numPages)}
                  disabled={currentPage >= numPages}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <button
                onClick={onDownload}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading PDF preview...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
