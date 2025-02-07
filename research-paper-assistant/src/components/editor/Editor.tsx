import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import type { Paper, Section } from '@/types/common';
import { pdfjs } from 'react-pdf';
import { generatePDF } from '@/utils/pdfGenerator';
import SectionEditor from './SectionEditor';
import PDFPreview from './PDFPreview';
import TitleEditor from './TitleEditor';
import AbstractEditor from './AbstractEditor';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteDoc } from 'firebase/firestore';

const Editor: React.FC = () => {
  const navigate = useNavigate();
  // Paper and sections state
  const [paper, setPaper] = useState<Paper | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // PDF state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // Generation state
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [regeneratingAbstract, setRegeneratingAbstract] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState(0);
  const [abstractProgress, setAbstractProgress] = useState(0);

  // Router and auth
  const { paperId: id } = useParams<{ paperId: string }>();
  const { user } = useAuth();

  useEffect(() => {
    const loadPaper = async () => {
      if (!user || !id) {
        setLoading(false);
        return;
      }

      try {
        const paperRef = doc(db, 'users', user.uid, 'papers', id);
        const paperDoc = await getDoc(paperRef);
        
        if (paperDoc.exists()) {
          const rawData = paperDoc.data();
          const paperData = {
            ...rawData,
            id: paperDoc.id,
            lastModified: rawData.lastModified?.toDate?.() ?? new Date(),
            createdAt: rawData.createdAt?.toDate?.() ?? new Date()
          } as Paper;
          
          setPaper(paperData);

          const defaultSections = [
            { id: 'abstract', title: 'Abstract', order: 0, content: '' },
            { id: 'intro', title: 'Introduction', order: 1, content: '' },
            { id: 'lit-review', title: 'Literature Review', order: 2, content: '' },
            { id: 'methodology', title: 'Methodology', order: 3, content: '' },
            { id: 'results', title: 'Results', order: 4, content: '' },
            { id: 'discussion', title: 'Discussion', order: 5, content: '' },
            { id: 'conclusion', title: 'Conclusion', order: 6, content: '' }
          ];

          // Use existing sections or initialize with defaults
          const existingSections = Array.isArray(paperData.sections) ? paperData.sections : [];
          const finalSections = existingSections.length > 0 
            ? existingSections 
            : defaultSections;

          // Ensure sections are sorted by order
          setSections(finalSections.sort((a, b) => a.order - b.order));
        } else {
          setError('Paper not found');
        }
      } catch (error) {
        console.error('Error loading paper:', error);
        setError(error instanceof Error ? error.message : 'Failed to load paper');
      } finally {
        setLoading(false);
      }
    };

    loadPaper();
  }, [user, id]);

  const handleUpdateAbstract = async (newAbstract: string) => {
    if (!user || !id || !paper) return;

    try {
      const updatedPaper = { ...paper, abstract: newAbstract };
      setPaper(updatedPaper);
      
      // Update PDF preview
      updatePDFPreview(updatedPaper, sections);

      // Save to database
      await updateDoc(doc(db, 'users', user.uid, 'papers', id), {
        abstract: newAbstract,
        lastModified: new Date()
      });
    } catch (error) {
      console.error('Error updating abstract:', error);
      setError(error instanceof Error ? error.message : 'Failed to update abstract');
      setPaper(paper); // Revert on error
    }
  };

  const handleRegenerateAbstract = async (prompt: string) => {
    if (!user || !id || !paper) return;

    setRegeneratingAbstract(true);
    setAbstractProgress(10);

    try {
      const response = await apiService.improveWriting(prompt.trim(), 'academic', {
        sectionTitle: 'Abstract',
        paperTitle: paper.title,
        abstract: paper.abstract
      });
      
      setAbstractProgress(60);
      const newContent = typeof response === 'object' && 'improved' in response
        ? response.improved
        : String(response || '').trim();

      setAbstractProgress(80);
      await handleUpdateAbstract(newContent);
      setAbstractProgress(100);
    } catch (error) {
      console.error('Error regenerating abstract:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate abstract');
    } finally {
      setTimeout(() => {
        setAbstractProgress(0);
        setRegeneratingAbstract(false);
      }, 1000);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!user || !id || !paper) return;

    try {
      const updatedPaper = { ...paper, title: newTitle };
      setPaper(updatedPaper);
      
      // Update PDF preview
      updatePDFPreview(updatedPaper, sections);

      // Save to database
      await updateDoc(doc(db, 'users', user.uid, 'papers', id), {
        title: newTitle,
        lastModified: new Date()
      });
    } catch (error) {
      console.error('Error updating title:', error);
      setError(error instanceof Error ? error.message : 'Failed to update title');
      setPaper(paper); // Revert on error
    }
  };

  const handleUpdateSection = async (sectionId: string, newContent: string) => {
    if (!user || !id || !paper) return;

    try {
      // Update state immediately for real-time preview
      const updatedSections = sections.map(section =>
        section.id === sectionId ? { ...section, content: newContent } : section
      );
      setSections(updatedSections);

      // Update PDF preview
      updatePDFPreview(paper, updatedSections);

      // Save to database
      await updateDoc(doc(db, 'users', user.uid, 'papers', id), {
        sections: updatedSections,
        lastModified: new Date()
      });
    } catch (error) {
      console.error('Error updating section:', error);
      setError(error instanceof Error ? error.message : 'Failed to update section');
      setSections(sections); // Revert on error
    }
  };

  const updatePDFPreview = (currentPaper: Paper, updatedSections: Section[]) => {
    try {
      setPdfError(null);
      const pdfData = generatePDF(currentPaper, updatedSections, false);
      if (pdfData) {
        setPdfUrl(pdfData);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError('Failed to update PDF preview');
    }
  };

  const handleRegenerateSection = async (sectionId: string) => {
    if (!user || !id || !paper || !prompt.trim()) return;

    setRegenerating(sectionId);
    setProgress(10);

    try {
      const currentSection = sections.find(s => s.id === sectionId);
      if (!currentSection) throw new Error('Section not found');

      setProgress(30);
      const response = await apiService.improveWriting(prompt.trim(), 'academic', {
        sectionTitle: currentSection.title,
        paperTitle: paper.title,
        abstract: paper.abstract
      });
      
      setProgress(60);
      const newContent = typeof response === 'object' && 'improved' in response
        ? response.improved
        : String(response || '').trim();

      setProgress(80);
      const updatedContent = currentSection.content
        ? `${currentSection.content}\n\n${newContent}`
        : newContent;

      await handleUpdateSection(sectionId, updatedContent);
      setProgress(100);
    } catch (error) {
      console.error('Error regenerating section:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate section');
    } finally {
      setTimeout(() => {
        setProgress(0);
        setRegenerating(null);
        setPrompt('');
      }, 1000);
    }
  };

  const handleDeletePaper = async () => {
    if (!user || !id || !paper) return;
    
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'papers', id));
      navigate('/'); // Navigate back to home page after deletion
    } catch (error) {
      console.error('Error deleting paper:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete paper');
    }
  };

  const handleDownloadPDF = () => {
    if (paper && sections.length > 0) {
      try {
        generatePDF(paper, sections, true);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        setError('Failed to download PDF');
      }
    }
  };

  useEffect(() => {
    if (paper && sections.length > 0) {
      updatePDFPreview(paper, sections);
    }
  }, [paper, sections]);

  if (loading || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-lg text-gray-600">Loading your paper...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paper not found</h2>
            <p className="text-gray-600 mb-4">The requested paper could not be loaded.</p>
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Status Bar */}
        <div className="flex justify-between items-center bg-white shadow-sm rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-500">
            Last modified: {paper.lastModified.toLocaleString()}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDeletePaper}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Paper
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download PDF
            </button>
          </div>
        </div>

        {(error || pdfError) && (
          <div className="mb-4 bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800">{error || pdfError}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel - Title and Section Editors */}
          <div className="space-y-6 overflow-auto max-h-[calc(100vh-250px)] pr-4">
            <TitleEditor
              title={paper.title}
              onTitleChange={handleUpdateTitle}
            />
            <AbstractEditor
              abstract={paper.abstract}
              isRegenerating={regeneratingAbstract}
              progress={abstractProgress}
              onAbstractChange={handleUpdateAbstract}
              onRegenerate={handleRegenerateAbstract}
            />
            {sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                isRegenerating={regenerating === section.id}
                progress={progress}
                prompt={prompt}
                onPromptChange={setPrompt}
                onRegenerate={() => handleRegenerateSection(section.id)}
                onContentChange={(content) => handleUpdateSection(section.id, content)}
              />
            ))}
          </div>

          {/* Right Panel - PDF Preview */}
          <PDFPreview
            pdfUrl={pdfUrl}
            currentPage={currentPage}
            numPages={numPages}
            onPageChange={(page, total) => {
              setCurrentPage(page);
              setNumPages(total);
            }}
            onDownload={handleDownloadPDF}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
