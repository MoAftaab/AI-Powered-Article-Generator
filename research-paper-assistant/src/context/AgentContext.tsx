import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { researchAgent } from '../services/ai/agent';
import type { SuggestionType } from '../types/common';

interface AgentState {
  isProcessing: boolean;
  suggestions: SuggestionType[];
  currentTask: string | null;
  error: string | null;
}

type AgentAction =
  | { type: 'START_PROCESSING'; task: string }
  | { type: 'STOP_PROCESSING' }
  | { type: 'ADD_SUGGESTION'; suggestion: SuggestionType }
  | { type: 'CLEAR_SUGGESTIONS' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

const initialState: AgentState = {
  isProcessing: false,
  suggestions: [],
  currentTask: null,
  error: null,
};

const agentReducer = (state: AgentState, action: AgentAction): AgentState => {
  switch (action.type) {
    case 'START_PROCESSING':
      return {
        ...state,
        isProcessing: true,
        currentTask: action.task,
        error: null,
      };
    case 'STOP_PROCESSING':
      return {
        ...state,
        isProcessing: false,
        currentTask: null,
      };
    case 'ADD_SUGGESTION':
      return {
        ...state,
        suggestions: [...state.suggestions, action.suggestion],
      };
    case 'CLEAR_SUGGESTIONS':
      return {
        ...state,
        suggestions: [],
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isProcessing: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AgentContextValue {
  state: AgentState;
  startProcessing: (task: string) => void;
  stopProcessing: () => void;
  addSuggestion: (suggestion: SuggestionType) => void;
  clearSuggestions: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  const value: AgentContextValue = {
    state,
    startProcessing: (task: string) => 
      dispatch({ type: 'START_PROCESSING', task }),
    stopProcessing: () => 
      dispatch({ type: 'STOP_PROCESSING' }),
    addSuggestion: (suggestion: SuggestionType) =>
      dispatch({ type: 'ADD_SUGGESTION', suggestion }),
    clearSuggestions: () => 
      dispatch({ type: 'CLEAR_SUGGESTIONS' }),
    setError: (error: string) => 
      dispatch({ type: 'SET_ERROR', error }),
    clearError: () => 
      dispatch({ type: 'CLEAR_ERROR' }),
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = (): AgentContextValue => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
