import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ArrowRightIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { usePaper } from '../hooks/usePaper';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { Paper, PaperFormat, GeneratedPaper } from '../types/common';
import { apiService } from '../services/api';

const PAPER_SECTIONS = [
  'Abstract',
  'Introduction',
  'Literature Review',
  'Methodology',
  'Results',
  'Discussion',
  'Conclusion',
  'References'
];

const Home: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [researchTopic, setResearchTopic] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [citationStyle, setCitationStyle] = useState<PaperFormat>('APA');
  const [error, setError] = useState<string | null>(null);
  const [generatingPaper, setGeneratingPaper] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { createPaper, getUserPapers } = usePaper();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const userPapers = await getUserPapers();
        setPapers(userPapers);
      } catch (error) {
        console.error('Error loading papers:', error);
      }
    };

    if (user) {
      loadPapers();
    }
  }, [user, getUserPapers]);
const handleGeneratePaper = async () => {
  try {
    if (!researchTopic.trim()) return;
    
    if (!user) {
      throw new Error('You must be logged in to generate a paper');
    }

    setGeneratingPaper(true);
    setError(null);
    setCompletedSections([]);

    // Generate complete paper using AI
    setCurrentSection('Starting generation...');
    const generatedPaper = await apiService.generatePaper(researchTopic);
    setCompletedSections(prev => [...prev, 'Starting generation']);
    
    if (!generatedPaper?.Abstract) {
      throw new Error('Failed to generate paper abstract');
    }
    
    // Create paper with abstract
    setCurrentSection('Creating paper structure...');
    setCompletedSections(prev => [...prev, 'Paper structure']);
    const newPaper = await createPaper(
      paperTitle || researchTopic,
      generatedPaper.Abstract
    );

      // Add abstract first
      if (!generatedPaper.Abstract) {
        throw new Error('Failed to generate abstract');
      }
      
      setCurrentSection('Adding Abstract...');
      setCompletedSections(prev => [...prev, 'Abstract']);
      
      // Add all sections with proper formatting
      const sections = PAPER_SECTIONS
        .filter(section => section !== 'Abstract') // Handle other sections
        .map(sectionTitle => {
          const content = generatedPaper[sectionTitle as keyof GeneratedPaper];
          if (!content) {
            throw new Error(`Failed to generate content for section: ${sectionTitle}`);
          }
          
          return {
            key: sectionTitle,
            title: sectionTitle,
            content: content
          };
        });

      for (const section of sections) {
        setCurrentSection(`Adding ${section.title}...`);
        try {
          await updateDoc(doc(db, 'users', user.uid, 'papers', newPaper.id), {
            sections: arrayUnion({
              id: uuidv4(),
              title: section.title,
              content: section.content,
              order: PAPER_SECTIONS.indexOf(section.title)
            })
          });
          // Add to completed sections only after successful update
          setCompletedSections(prev => [...prev, section.title]);
        } catch (error) {
          console.error(`Error adding section ${section.title}:`, error);
          throw new Error(`Failed to add section: ${section.title}`);
        }
      }
      
      // Add citations
      setCurrentSection('Adding citations...');
      setCompletedSections(prev => [...prev, 'Citations']);
      const citations = await apiService.fetchCitations(researchTopic);
      await updateDoc(doc(db, 'users', user.uid, 'papers', newPaper.id), {
        citations: citations.map(citation => ({
          ...citation,
          id: uuidv4()
        }))
      });

      setShowGenerateDialog(false);
      setResearchTopic('');
      setCitationStyle('APA');
      // Keep completed sections for successful generation
      navigate(`/editor/${newPaper.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate paper';
      console.error('Error generating paper:', error);
      setError(errorMessage);
      setCompletedSections([]); // Clear sections on error
    } finally {
      setGeneratingPaper(false);
      setCurrentSection(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Research Paper Assistant
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Please sign in to manage your research papers
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Research Papers</h1>
          <button
            onClick={() => setShowGenerateDialog(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Generate Paper
          </button>
        </div>

        {papers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No papers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating a new research paper
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowGenerateDialog(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Generate Paper
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {paper.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {paper.abstract}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(paper.lastModified).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this paper?') && user) {
                            try {
                              await deleteDoc(doc(db, 'users', user.uid, 'papers', paper.id));
                              setPapers(currentPapers => currentPapers.filter(p => p.id !== paper.id));
                            } catch (error) {
                              console.error('Error deleting paper:', error);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => navigate(`/editor/${paper.id}`)}
                        className="flex items-center text-blue-600 hover:text-blue-700"
                      >
                        Open
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Paper Dialog */}
      {showGenerateDialog && (
        <div className="fixed inset-0 flex z-50">
          {/* Left side - Input form */}
          <div className="flex-1 bg-black bg-opacity-50 p-4 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              {error && (
                <div className="mb-4 bg-red-50 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XMarkIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center mb-6">
                <AcademicCapIcon className="h-8 w-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold">Generate Research Paper</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="paperTitle" className="block text-sm font-medium text-gray-700">
                    Paper Title
                  </label>
                  <input
                    type="text"
                    id="paperTitle"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter the title for your paper"
                  />
                </div>
                <div>
                  <label htmlFor="researchTopic" className="block text-sm font-medium text-gray-700">
                    Research Topic
                  </label>
                  <textarea
                    id="researchTopic"
                    value={researchTopic}
                    onChange={(e) => setResearchTopic(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter your prompt to add more details..."      
                  />
                </div>
                <div>
                  <label htmlFor="citationStyle" className="block text-sm font-medium text-gray-700">
                    Citation Style
                  </label>
                  <select
                    id="citationStyle"
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value as PaperFormat)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="APA">APA</option>
                    <option value="MLA">MLA</option>
                    <option value="Chicago">Chicago</option>
                    <option value="IEEE">IEEE</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowGenerateDialog(false);
                    setResearchTopic('');
                    setPaperTitle('');
                    setCitationStyle('APA');
                    setCompletedSections([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePaper}
                  disabled={!researchTopic.trim() || !paperTitle.trim() || generatingPaper}
                  className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center ${
                    generatingPaper || !researchTopic.trim() || !paperTitle.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {generatingPaper ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Paper'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Generation progress */}
          <div className="w-1/3 bg-gray-900 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Generation Progress</h3>
              <button
                onClick={() => {
                  setShowGenerateDialog(false);
                  setResearchTopic('');
                  setPaperTitle('');
                  setCitationStyle('APA');
                }}
                className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
              >
                Back
              </button>
            </div>
            {currentSection && (
              <div className="space-y-4">
                {PAPER_SECTIONS.map((section) => {
                  const isCompleted = completedSections.includes(section) ||
                    (currentSection?.includes(section) && !generatingPaper);
                  const isInProgress = currentSection?.includes(section) && generatingPaper;
                  
                  return (
                    <div
                      key={section}
                      className={`p-4 rounded-lg ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="flex-1">{section}</span>
                        {isCompleted ? (
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isInProgress ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
