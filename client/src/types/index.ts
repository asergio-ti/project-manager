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

// Tipos base do sistema
export type DocumentPhase = 'DVP' | 'DRS' | 'DAS' | 'DADI';
export type DocumentStatus = 'draft' | 'in_progress' | 'review' | 'approved';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

// Interfaces de Documento
export interface Document {
  id: string;
  name: string;
  phase: DocumentPhase;
  status: DocumentStatus;
  content: DocumentContent;
  metadata: DocumentMetadata;
  analysis: DocumentAnalysis;
}

export interface DocumentContent {
  sections: DocumentSection[];
  extractedTopics: string[];
  identifiedConcerns: string[];
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  confidence: ConfidenceLevel;
  needsReview: boolean;
  suggestedImprovements?: string[];
  subsections?: DocumentSection[];
}

export interface DocumentMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  author: string;
  lastAnalysis: string;
}

export interface DocumentAnalysis {
  domainType: string;
  complexity: ComplexityLevel;
  identifiedPatterns: string[];
  suggestedApproaches: string[];
  riskAreas: string[];
  completeness: number;
}

// Interfaces de Entrevista
export interface ConversationContext {
  currentPhase: DocumentPhase;
  conversationHistory: ConversationEntry[];
  identifiedTopics: Set<string>;
  confidenceLevels: Record<string, number>;
  activeTopics: string[];
  pendingQuestions: Question[];
}

export interface ConversationEntry {
  id: string;
  timestamp: string;
  type: 'user' | 'assistant';
  content: string;
  analysis?: {
    topics: string[];
    sentiment: string;
    confidence: number;
    suggestedFollowUps: string[];
  };
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  context?: string;
  priority: number;
  followUpStrategy?: FollowUpStrategy;
}

export type QuestionType = 
  | 'open_exploration'     // Perguntas abertas para explorar tópicos
  | 'clarification'        // Pedir esclarecimentos sobre algo mencionado
  | 'confirmation'         // Confirmar entendimento
  | 'elaboration'         // Pedir mais detalhes
  | 'suggestion'          // Sugerir considerações
  | 'validation';         // Validar informações específicas

export interface FollowUpStrategy {
  conditions: string[];
  triggers: string[];
  alternativeQuestions: Question[];
  confidenceThreshold: number;
}

// Interfaces de Análise
export interface AnalysisResult {
  topics: Topic[];
  patterns: Pattern[];
  concerns: Concern[];
  suggestions: Suggestion[];
  confidence: number;
}

export interface Topic {
  name: string;
  relevance: number;
  confidence: number;
  relatedTopics: string[];
  needsElaboration: boolean;
}

export interface Pattern {
  type: string;
  confidence: number;
  implications: string[];
  suggestedPractices: string[];
}

export interface Concern {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedActions: string[];
}

export interface Suggestion {
  type: string;
  priority: number;
  description: string;
  rationale: string;
  impact: string[];
}

// Interfaces de Contexto
export interface InterviewContext {
  projectContext: ProjectContext;
  conversationContext: ConversationContext;
  analysisContext: AnalysisContext;
  domainAnalysis?: string;
  complexityLevel?: 'high' | 'medium' | 'low';
}

export interface ProjectContext {
  id: string;
  name: string;
  currentPhase: DocumentPhase;
  currentDocument?: Document;
  domainType: string;
  complexity: ComplexityLevel;
}

export interface AnalysisContext {
  identifiedPatterns: Pattern[];
  currentConfidence: Record<string, number>;
  pendingTopics: string[];
  suggestedApproaches: string[];
}

// Tipos de Complexidade
export type ComplexityLevel = {
  overall: 'low' | 'medium' | 'high';
  factors: {
    technical: number;
    business: number;
    integration: number;
    security: number;
    scale: number;
  };
  indicators: string[];
};

// Interfaces de Validação
export interface ValidationResult {
  isValid: boolean;
  feedback: string;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
  confidence: number;
}

export interface ValidationContext {
  schema: Schema | string;
  phase: DocumentPhase;
  document: Document;
  previousDocuments?: Document[];
  projectContext?: ProjectContext;
  conversationContext?: ConversationContext;
  analysisContext?: AnalysisContext;
}

// Interfaces de Schema
export interface Schema {
  id: string;
  version: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
}

export interface SchemaProperty {
  type: string;
  description: string;
  pattern?: string;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
}

// Interfaces de Estado
export interface ProjectState {
  currentPhase: DocumentPhase;
  documents: Document[];
  messages: Message[];
  context: ProjectContext;
  loading: boolean;
  error?: string;
}

// Ações do Reducer
export type Action =
  | { type: 'SET_PHASE'; payload: DocumentPhase }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined };

// Configurações
export interface ApiConfig {
  baseURL: string;
  apiKey: string;
  version: string;
} 