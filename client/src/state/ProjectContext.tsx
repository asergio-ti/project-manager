import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ProjectState, Action, Document, Message, DocumentPhase } from '../types';

const initialState: ProjectState = {
  currentPhase: 'DVP',
  documents: [],
  messages: [],
  context: {
    id: '',
    name: '',
  },
  loading: false,
};

function projectReducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case 'SET_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
      };
    
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload],
      };
    
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? action.payload : doc
        ),
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    default:
      return state;
  }
}

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<Action>;
  actions: {
    setPhase: (phase: DocumentPhase) => void;
    addDocument: (document: Document) => void;
    updateDocument: (document: Document) => void;
    addMessage: (message: Message) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | undefined) => void;
  };
} | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const actions = {
    setPhase: useCallback((phase: DocumentPhase) => {
      dispatch({ type: 'SET_PHASE', payload: phase });
    }, []),

    addDocument: useCallback((document: Document) => {
      dispatch({ type: 'ADD_DOCUMENT', payload: document });
    }, []),

    updateDocument: useCallback((document: Document) => {
      dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
    }, []),

    addMessage: useCallback((message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setError: useCallback((error: string | undefined) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),
  };

  return (
    <ProjectContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

// Hooks específicos para cada funcionalidade
export const useDocuments = () => {
  const { state, actions } = useProject();
  
  return {
    documents: state.documents,
    currentPhase: state.currentPhase,
    addDocument: actions.addDocument,
    updateDocument: actions.updateDocument,
  };
};

export const useMessages = () => {
  const { state, actions } = useProject();
  
  return {
    messages: state.messages,
    addMessage: actions.addMessage,
  };
};

export const usePhase = () => {
  const { state, actions } = useProject();
  
  return {
    currentPhase: state.currentPhase,
    setPhase: actions.setPhase,
  };
};

export const useLoading = () => {
  const { state, actions } = useProject();
  
  return {
    loading: state.loading,
    setLoading: actions.setLoading,
    error: state.error,
    setError: actions.setError,
  };
}; 