export interface Section {
  id: string;
  title: string;
  content: string;
  type: SectionType;
  order: number;
}

export type SectionType =
  | 'title'
  | 'abstract'
  | 'introduction'
  | 'literature-review'
  | 'methodology'
  | 'results'
  | 'discussion'
  | 'conclusion'
  | 'references';

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

export interface Citation {
  id: string;
  text: string;
  doi?: string;
  type: 'article' | 'book' | 'conference' | 'other';
  metadata: {
    authors: string[];
    year: number;
    title: string;
    journal?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    publisher?: string;
  };
}

export interface SuggestionType {
  type: 'grammar' | 'style' | 'clarity' | 'citation' | 'structure';
  content: string;
  section: string;
  position: number;
  severity: 'low' | 'medium' | 'high';
}

export interface IEEEStyle {
  title: {
    fontSize: string;
    fontWeight: string;
    textAlign: string;
    marginBottom: string;
  };
  section: {
    heading: {
      fontSize: string;
      fontWeight: string;
      marginTop: string;
      marginBottom: string;
    };
    text: {
      fontSize: string;
      lineHeight: string;
      textAlign: string;
    };
  };
  abstract: {
    italic: boolean;
    maxWords: number;
  };
  references: {
    style: string;
    indentation: string;
  };
}
