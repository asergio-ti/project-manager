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
