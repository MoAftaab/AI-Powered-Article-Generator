export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  sections: Section[];
  citations: Citation[];
  lastModified: Date;
  createdAt: Date;
  userId: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Citation {
  id: string;
  text: string;
  type: 'article' | 'book' | 'conference' | 'website';
  authors: string[];
  year: string;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
  citationText?: string;
}

export type SuggestionType = {
  type: 'clarity' | 'structure' | 'style' | 'grammar' | 'citation';
  content: string;
  severity: 'low' | 'medium' | 'high';
  section: string;
  position: number;
};

export type OutlineSection = {
  title: string;
  description: string;
};

export type WritingAspect = 'clarity' | 'conciseness' | 'academic';

export type WritingImprovement = {
  improved: string;
  suggestions: SuggestionType[];
};

export type PaperFormat = 'APA' | 'MLA' | 'Chicago' | 'IEEE';

export interface PDFPreviewProps {
  pdfUrl: string | null;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number, totalPages: number) => void;
  onDownload: () => void;
}

export interface ProgressBarProps {
  progress: number;
  className?: string;
}

export interface SectionEditorProps {
  section: Section;
  isRegenerating: boolean;
  progress: number;
  prompt: string;
  onPromptChange: (value: string) => void;
  onRegenerate: () => void;
  onContentChange: (content: string) => void;
}

export interface PaperRequirements {
  abstractLength: number;
  introductionLength: number;
  literatureReviewLength: number;
  methodologyLength: number;
  includeVisuals: boolean;
}

export interface RequestBody {
  topic?: string;
  keywords?: string[];
  title?: string;
  mainPoints?: string[];
  content?: string;
  text?: string;
  prompt?: string;
  aspect?: WritingAspect;
  paper?: GeneratedPaper;
  style?: PaperFormat;
  requirements?: PaperRequirements;
  context?: {
    sectionTitle?: string;
    paperTitle?: string;
    abstract?: string;
  };
}

export interface GeneratedPaper {
  Abstract: string;
  Introduction: string;
  'Literature Review': string;
  Methodology: string;
  Results: string;
  Discussion: string;
  Conclusion: string;
  References: string;
}

export interface Tool {
  id: string;
  label: string;
  onClick: () => void;
}
