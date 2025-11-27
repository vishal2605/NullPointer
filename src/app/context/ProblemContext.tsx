'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CodeState {
  [problemId: string]: {
    [language: string]: string;
  };
}

interface ProblemContextType {
  codeState: CodeState;
  setCodeForProblem: (problemId: number, language: string, code: string) => void;
  getCodeForProblem: (problemId: number, language: string, defaultCode?: string) => string;
  clearProblemCode: (problemId: number, language?: string) => void;
  clearAllCode: () => void;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

// localStorage key
const STORAGE_KEY = 'problem-code-state';

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [codeState, setCodeState] = useState<CodeState>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        setCodeState(parsedState);
      }
    } catch (error) {
      console.error('Failed to load code state from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever codeState changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(codeState));
      } catch (error) {
        console.error('Failed to save code state to localStorage:', error);
      }
    }
  }, [codeState, isLoaded]);

  const setCodeForProblem = (problemId: number, language: string, code: string) => {
    setCodeState(prev => ({
      ...prev,
      [problemId]: {
        ...prev[problemId],
        [language]: code
      }
    }));
  };

  const getCodeForProblem = (problemId: number, language: string, defaultCode: string = '') => {
    return codeState[problemId]?.[language] || defaultCode;
  };

  const clearProblemCode = (problemId: number, language?: string) => {
    setCodeState(prev => {
      const newState = { ...prev };
      
      if (language && newState[problemId]) {
        // Clear specific language for this problem
        const { [language]: _, ...remainingLanguages } = newState[problemId];
        if (Object.keys(remainingLanguages).length === 0) {
          // If no languages left, remove the entire problem entry
          delete newState[problemId];
        } else {
          newState[problemId] = remainingLanguages;
        }
      } else {
        // Clear all languages for this problem
        delete newState[problemId];
      }
      
      return newState;
    });
  };

  const clearAllCode = () => {
    setCodeState({});
  };

  return (
    <ProblemContext.Provider value={{ 
      codeState, 
      setCodeForProblem, 
      getCodeForProblem,
      clearProblemCode,
      clearAllCode
    }}>
      {children}
    </ProblemContext.Provider>
  );
}

export function useProblem() {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider');
  }
  return context;
}