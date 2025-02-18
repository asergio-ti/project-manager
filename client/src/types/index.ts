export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  name?: string;
}

export interface ChatState {
  currentUser: User;
  conversations: Conversation[];
  activeConversation?: Conversation;
  messages: Record<string, Message[]>;
}

// Tipos Base
export type DocumentStatus = 'pending' | 'in-progress' | 'completed';
export type DocumentPhase = 'DVP' | 'DRS' | 'DAS';

// Domínio: Documentation
export interface Document {
  id: string;
  name: string;
  phase: DocumentPhase;
  status: DocumentStatus;
  progress: number;
  content?: {
    title: string;
    description: string;
    sections: {
      title: string;
      content: string;
      subsections?: {
        title: string;
        content: string;
      }[];
    }[];
  };
}

export interface DocumentMetadata {
  lastModified: Date;
  version: string;
  author: string;
}

// Domínio: Interview
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  reference?: string;
}

export interface InterviewContext {
  currentDocument?: string;
  activeSection?: string;
  phase: DocumentPhase;
}

export interface InterviewConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
}

// Domínio: Validation
export interface ValidationResult {
  isValid: boolean;
  feedback: string;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface ValidationContext {
  schema: string;
  phase: DocumentPhase;
  document: Document;
}

// Estado da Aplicação
export interface ProjectState {
  documents: Document[];
  messages: Message[];
  context: ProjectContext;
  loading: boolean;
  error?: string;
}

export interface ProjectContext {
  currentPhase: DocumentPhase;
  activeDocument?: Document;
  lastValidation?: ValidationResult;
}

export interface TimelineState {
  currentPhase: DocumentPhase;
  phases: {
    id: DocumentPhase;
    status: DocumentStatus;
    progress: number;
    documents: Document[];
  }[];
}

// Configurações
export interface ApiConfig {
  baseURL: string;
  apiKey: string;
  version: string;
} 