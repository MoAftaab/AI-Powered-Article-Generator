import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Paper, Section, Citation } from '../types/common';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs,
  FirestoreError,
  Timestamp
} from 'firebase/firestore';

// Type for Firestore document with Timestamps instead of Dates
interface FirestorePaper extends Omit<Paper, 'createdAt' | 'lastModified'> {
  createdAt: Timestamp;
  lastModified: Timestamp;
}

interface UsePaperReturn {
  paper: Paper | null;
  loading: boolean;
  error: string | null;
  createPaper: (title: string, abstract: string) => Promise<Paper>;
  updatePaper: (updates: Partial<Paper>) => Promise<void>;
  addSection: (section: Omit<Section, 'id'>) => Promise<Section>;
  updateSection: (sectionId: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  addCitation: (citation: Omit<Citation, 'id'>) => Promise<void>;
  updateCitation: (citationId: string, updates: Partial<Citation>) => Promise<void>;
  deleteCitation: (citationId: string) => Promise<void>;
  loadPaper: (paperId: string) => Promise<void>;
  getUserPapers: () => Promise<Paper[]>;
}

const createErrorMessage = (error: unknown): string => {
  if (error instanceof FirestoreError) {
    return `Database error: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// Convert Firestore data to client-side Paper type
const convertToPaper = (data: FirestorePaper): Paper => ({
  ...data,
  createdAt: data.createdAt.toDate(),
  lastModified: data.lastModified.toDate()
});

export const usePaper = (): UsePaperReturn => {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getPaperRef = useCallback((paperId: string) => {
    if (!user) throw new Error('User must be authenticated');
    return doc(db, 'users', user.uid, 'papers', paperId);
  }, [user]);

  const handleOperation = async <T,>(operation: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createPaper = useCallback(async (title: string, abstract: string): Promise<Paper> => {
    if (!user) {
      throw new Error('User must be authenticated to create a paper');
    }

    return handleOperation(async () => {
      const paperId = uuidv4();
      const now = Timestamp.now();
      
      const firestorePaper: FirestorePaper = {
        id: paperId,
        title,
        abstract,
        sections: [],
        citations: [],
        lastModified: now,
        createdAt: now,
        userId: user.uid
      };

      const ref = getPaperRef(paperId);
      await setDoc(ref, firestorePaper);

      const paperWithDates = convertToPaper(firestorePaper);
      setPaper(paperWithDates);
      return paperWithDates;
    });
  }, [user, getPaperRef]);

  const updatePaper = useCallback(async (updates: Partial<Paper>): Promise<void> => {
    if (!paper) throw new Error('No paper selected');

    return handleOperation(async () => {
      const now = Timestamp.now();
      const firestoreUpdates = {
        ...updates,
        lastModified: now
      };

      const ref = getPaperRef(paper.id);
      await updateDoc(ref, firestoreUpdates);

      const updatedPaper = {
        ...paper,
        ...updates,
        lastModified: now.toDate()
      };
      setPaper(updatedPaper);
    });
  }, [paper, getPaperRef]);

  const updateSectionsList = useCallback(async (newSections: Section[]): Promise<void> => {
    if (!paper) throw new Error('No paper selected');

    const now = Timestamp.now();
    const ref = getPaperRef(paper.id);
    
    const updates = {
      sections: newSections,
      lastModified: now
    };

    await updateDoc(ref, updates);
    setPaper({
      ...paper,
      sections: newSections,
      lastModified: now.toDate()
    });
  }, [paper, getPaperRef]);

  const addSection = useCallback(async (sectionData: Omit<Section, 'id'>): Promise<Section> => {
    return handleOperation(async () => {
      const newSection: Section = {
        ...sectionData,
        id: uuidv4()
      };

      await updateSectionsList([...(paper?.sections || []), newSection]);
      return newSection;
    });
  }, [paper, updateSectionsList]);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<Section>): Promise<void> => {
    return handleOperation(async () => {
      if (!paper) throw new Error('No paper selected');

      const updatedSections = paper.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      );

      await updateSectionsList(updatedSections);
    });
  }, [paper, updateSectionsList]);

  const deleteSection = useCallback(async (sectionId: string): Promise<void> => {
    return handleOperation(async () => {
      if (!paper) throw new Error('No paper selected');

      const updatedSections = paper.sections.filter(
        section => section.id !== sectionId
      );

      await updateSectionsList(updatedSections);
    });
  }, [paper, updateSectionsList]);

  const updateCitationsList = useCallback(async (newCitations: Citation[]): Promise<void> => {
    if (!paper) throw new Error('No paper selected');

    const now = Timestamp.now();
    const ref = getPaperRef(paper.id);
    
    const updates = {
      citations: newCitations,
      lastModified: now
    };

    await updateDoc(ref, updates);
    setPaper({
      ...paper,
      citations: newCitations,
      lastModified: now.toDate()
    });
  }, [paper, getPaperRef]);

  const addCitation = useCallback(async (citationData: Omit<Citation, 'id'>): Promise<void> => {
    return handleOperation(async () => {
      const newCitation: Citation = {
        ...citationData,
        id: uuidv4()
      };

      await updateCitationsList([...(paper?.citations || []), newCitation]);
    });
  }, [paper, updateCitationsList]);

  const updateCitation = useCallback(async (citationId: string, updates: Partial<Citation>): Promise<void> => {
    return handleOperation(async () => {
      if (!paper) throw new Error('No paper selected');

      const updatedCitations = paper.citations.map(citation =>
        citation.id === citationId ? { ...citation, ...updates } : citation
      );

      await updateCitationsList(updatedCitations);
    });
  }, [paper, updateCitationsList]);

  const deleteCitation = useCallback(async (citationId: string): Promise<void> => {
    return handleOperation(async () => {
      if (!paper) throw new Error('No paper selected');

      const updatedCitations = paper.citations.filter(
        citation => citation.id !== citationId
      );

      await updateCitationsList(updatedCitations);
    });
  }, [paper, updateCitationsList]);

  const loadPaper = useCallback(async (paperId: string): Promise<void> => {
    return handleOperation(async () => {
      if (!user) throw new Error('User must be authenticated');

      const ref = getPaperRef(paperId);
      const paperDoc = await getDoc(ref);
      
      if (!paperDoc.exists()) {
        throw new Error('Paper not found');
      }

      const paperData = paperDoc.data() as FirestorePaper;
      setPaper(convertToPaper(paperData));
    });
  }, [user, getPaperRef]);

  const getUserPapers = useCallback(async (): Promise<Paper[]> => {
    if (!user) {
      throw new Error('User must be authenticated to list papers');
    }

    return handleOperation(async () => {
      const userPapersRef = collection(db, 'users', user.uid, 'papers');
      const querySnapshot = await getDocs(userPapersRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestorePaper;
        return convertToPaper(data);
      });
    });
  }, [user]);

  return {
    paper,
    loading,
    error,
    createPaper,
    updatePaper,
    addSection,
    updateSection,
    deleteSection,
    addCitation,
    updateCitation,
    deleteCitation,
    loadPaper,
    getUserPapers,
  };
};
