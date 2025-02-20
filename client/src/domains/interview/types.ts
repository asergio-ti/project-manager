import { DocumentPhase } from '../../types';

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

export interface Question {
  id: string;
  text: string;
  phase: DocumentPhase;
  priority: number;
  context?: string;
  followUp?: string[];
}
