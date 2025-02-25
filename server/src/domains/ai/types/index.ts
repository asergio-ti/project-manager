export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: MessageContext;
}

export interface MessageContext {
    projectId: string;
    phase: 'DVP' | 'DRS' | 'DAS' | 'DADI';
    currentField?: string;
    suggestedFields?: string[];
    confidence?: number;
    detectedFields?: Array<{
        phase: string;
        field: string;
        value: any;
        confidence: number;
    }>;
    suggestions?: string[];
}

export interface ContextAnalysis {
    detectedPhase?: 'DVP' | 'DRS' | 'DAS' | 'DADI';
    detectedFields: Array<{
        phase: string;
        field: string;
        value: any;
        confidence: number;
    }>;
    suggestions: Array<{
        type: 'field_update' | 'next_question' | 'validation';
        description: string;
        confidence: number;
    }>;
    nextQuestion?: string;
}

export interface AIServiceConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey: string;
    maxCacheSize?: number;
    cacheTTLMinutes?: number;
    retry?: {
        maxAttempts?: number;     // Número máximo de tentativas
        initialDelayMs?: number;  // Delay inicial entre tentativas
        maxDelayMs?: number;      // Delay máximo entre tentativas
        backoffFactor?: number;   // Fator de multiplicação do delay
        retryableErrors?: number[]; // Códigos HTTP que devem ser retentados
    };
    cacheTTLMs?: number; // Tempo de vida do cache em milissegundos
}

export interface ConversationState {
    projectId: string;
    messages: ChatMessage[];
    currentPhase: 'DVP' | 'DRS' | 'DAS' | 'DADI';
    context: {
        completedFields: string[];
        pendingFields: string[];
        lastQuestion?: string;
        lastAnalysis?: ContextAnalysis;
    };
} 