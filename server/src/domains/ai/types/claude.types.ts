export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ClaudeRequest {
    model: string;
    messages: ClaudeMessage[];
    temperature?: number;
    max_tokens?: number;
    system?: string;
}

export interface ClaudeResponse {
    id: string;
    model: string;
    role: 'assistant';
    content: string;
    stop_reason: string;
    stop_sequence: string | null;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

export interface ClaudeError {
    type: string;
    message: string;
    code?: number;
} 