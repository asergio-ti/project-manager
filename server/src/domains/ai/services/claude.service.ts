import axios from 'axios';
import { 
    ClaudeMessage, 
    ClaudeRequest, 
    ClaudeResponse, 
    ClaudeError 
} from '../types/claude.types';
import { AIServiceConfig } from '../types';
import crypto from 'crypto';

interface CacheEntry {
    value: string;
    timestamp: number;
    ttl: number;
}

interface MessageCache {
    get(key: string): CacheEntry | undefined;
    set(key: string, value: CacheEntry): void;
    has(key: string): boolean;
    delete(key: string): void;
}

class InMemoryCache implements MessageCache {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly maxSize: number;
    private readonly ttlMs: number;

    constructor(maxSize: number = 1000, ttlMinutes: number = 60) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMinutes * 60 * 1000;
    }

    private generateKey(messages: ClaudeMessage[], systemPrompt: string | undefined): string {
        const messagesStr = JSON.stringify(messages);
        return systemPrompt ? `${messagesStr}:${systemPrompt}` : messagesStr;
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttlMs) {
                this.cache.delete(key);
            }
        }
    }

    get(key: string): CacheEntry | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        // Verificar TTL
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return undefined;
        }

        return entry;
    }

    set(key: string, value: CacheEntry): void {
        // Limpar entradas expiradas antes de adicionar nova
        this.cleanup();

        // Se atingiu o limite, remover entrada mais antiga
        if (this.cache.size >= this.maxSize) {
            const oldestKey = Array.from(this.cache.keys())[0];
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, value);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
    }
}

interface RetryConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
    retryableErrors: number[];
}

class ClaudeNetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClaudeNetworkError';
    }
}

class ClaudeTimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClaudeTimeoutError';
    }
}

class ClaudeRateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClaudeRateLimitError';
    }
}

class ClaudeValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClaudeValidationError';
    }
}

class ClaudeResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClaudeResponseError';
    }
}

export class ClaudeService {
    private readonly apiKey: string;
    private readonly baseURL = 'https://api.anthropic.com/v1';
    private readonly defaultModel: string;
    private readonly defaultTemperature: number;
    private readonly defaultMaxTokens: number;
    private readonly cache: MessageCache;
    private readonly retryConfig: RetryConfig;
    private readonly config: AIServiceConfig;

    constructor(config: AIServiceConfig) {
        if (!config) {
            throw new Error('API Key do Claude não configurada');
        }

        this.apiKey = config.apiKey;
        this.defaultModel = config.model || 'claude-3-sonnet';
        this.defaultTemperature = config.temperature || 0.7;
        this.defaultMaxTokens = config.maxTokens || 2000;
        this.cache = new InMemoryCache(
            config.maxCacheSize || 1000,
            config.cacheTTLMinutes || 60
        );

        // Configuração padrão de retry
        this.retryConfig = {
            maxAttempts: config.retry?.maxAttempts || 3,
            initialDelayMs: config.retry?.initialDelayMs || 1000,
            maxDelayMs: config.retry?.maxDelayMs || 10000,
            backoffFactor: config.retry?.backoffFactor || 2,
            retryableErrors: config.retry?.retryableErrors || [429, 500, 502, 503, 504]
        };

        if (!this.apiKey) {
            throw new Error('API Key do Claude não configurada');
        }

        this.config = config;
    }

    private handleError(error: any): never {
        // Se já for um erro conhecido do Claude, propaga
        if (error instanceof ClaudeTimeoutError ||
            error instanceof ClaudeNetworkError ||
            error instanceof ClaudeRateLimitError ||
            error instanceof ClaudeValidationError ||
            error instanceof ClaudeResponseError) {
            throw error;
        }

        // 1. Erros de rede (sem resposta do servidor)
        if (!error.response) {
            if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
                throw new ClaudeTimeoutError('Erro ao comunicar com a API do Claude: Timeout');
            }
            if (error.message === 'Network Error') {
                throw new ClaudeNetworkError('Erro ao comunicar com a API do Claude: Network Error');
            }
            throw new ClaudeNetworkError('Erro ao comunicar com a API do Claude');
        }

        // 2. Rate Limit (429)
        if (error?.response?.status === 429) {
            throw new ClaudeRateLimitError('Erro na API do Claude: Rate limit exceeded');
        }

        // 3. Erros de validação (400)
        if (error?.response?.status === 400) {
            const message = error?.response?.data?.error?.message;
            if (message?.includes('system prompt')) {
                throw new ClaudeValidationError('Erro na API do Claude: Invalid system prompt');
            }
            if (message?.includes('message content')) {
                throw new ClaudeValidationError('Erro na API do Claude: Invalid message content');
            }
            throw new ClaudeValidationError('Erro na API do Claude: Invalid message format');
        }

        // 4. Erros de resposta
        if (!error?.response?.data) {
            throw new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
        }

        // 5. Erro com mensagem específica da API
        if (error.response.data.error?.message) {
            throw new ClaudeResponseError(`Erro na API do Claude: ${error.response.data.error.message}`);
        }

        // 6. Resposta malformada ou vazia
        if (error.response.data && Object.keys(error.response.data).length === 0) {
            throw new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
        }

        // 7. Resposta parcialmente válida
        if (error.response.data && (!error.response.data.content || !error.response.data.role)) {
            throw new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
        }

        // 8. Erro genérico como último caso
        throw new ClaudeResponseError('Erro na API do Claude: Erro genérico');
    }

    private isEmptyResponse(response: any): boolean {
        return !response?.data || Object.keys(response.data).length === 0;
    }

    private isPartialResponse(response: any): boolean {
        const { data } = response;
        return data && Object.keys(data).length > 0 && (!data.content || !data.role);
    }

    private hasRequiredFields(response: any): boolean {
        const requiredFields = ['content', 'role'];
        return requiredFields.every(field => response.data[field]);
    }

    private isValidRole(response: any): boolean {
        return response.data.role === 'assistant';
    }

    private validateResponse(response: any): ClaudeResponse {
        if (this.isEmptyResponse(response)) {
            throw new ClaudeResponseError('Erro na API do Claude: Resposta inválida');
        }

        if (this.isPartialResponse(response)) {
            throw new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
        }

        if (!this.hasRequiredFields(response)) {
            throw new ClaudeResponseError('Erro na API do Claude: Resposta inválida');
        }

        if (!this.isValidRole(response)) {
            throw new ClaudeResponseError('Erro na API do Claude: Resposta inválida');
        }

        const { content, id, model, role, stop_reason, stop_sequence, usage } = response.data;
        return { content, id, model, role, stop_reason, stop_sequence, usage };
    }

    private getCacheKey(messages: ClaudeMessage[], systemPrompt?: string): string {
        const key = JSON.stringify({ messages, systemPrompt });
        return crypto.createHash('md5').update(key).digest('hex');
    }

    private async getFromCache(key: string): Promise<ClaudeResponse | null> {
        const cached = this.cache.get(key);
        if (!cached) return null;

        try {
            const response = JSON.parse(cached.value);
            if (!response || !response.id || !response.role || !response.content) {
                this.cache.delete(key);
                return null;
            }
            return response;
        } catch (error) {
            this.cache.delete(key);
            return null;
        }
    }

    private setInCache(key: string, response: ClaudeResponse): void {
        try {
            if (!response || !response.id || !response.role || !response.content) {
                return;
            }
            const entry: CacheEntry = {
                value: JSON.stringify(response),
                timestamp: Date.now(),
                ttl: this.config.cacheTTLMs || 3600000 // 1 hora por padrão
            };
            this.cache.set(key, entry);
        } catch (error) {
            console.error('Erro ao validar resposta para cache:', error);
        }
    }

    private generateCacheKey(messages: ClaudeMessage[], systemPrompt?: string): string {
        const key = {
            messages,
            systemPrompt,
            model: this.defaultModel,
            temperature: this.defaultTemperature,
            maxTokens: this.defaultMaxTokens
        };
        return JSON.stringify(key);
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private calculateBackoff(attempt: number): number {
        const delay = this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffFactor, attempt - 1);
        return Math.min(delay, this.retryConfig.maxDelayMs);
    }

    private isRetryableError(error: any): boolean {
        // Erros de rede são retryable
        if (!error.response) {
            return true;
        }

        // Rate limit não é mais retryable (será tratado separadamente)
        if (error?.response?.status === 429) {
            return false;
        }

        // Outros erros não são retryable
        return false;
    }

    private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        let attempt = 1;
        const maxAttempts = 3;
        const baseDelay = 1000; // 1 segundo

        while (attempt <= maxAttempts) {
            try {
                const result = await operation();
                try {
                    // Tenta validar a resposta primeiro
                    if (result && typeof result === 'object' && 'data' in result) {
                        this.validateResponse(result);
                    }
                    return result;
                } catch (validationError) {
                    throw validationError; // Propaga erro de validação
                }
            } catch (error: any) {
                // 1. Se já for um erro de resposta, propaga
                if (error instanceof ClaudeResponseError) {
                    throw error;
                }

                // 2. Verificar rate limit (429)
                if (error?.response?.status === 429) {
                    throw new ClaudeRateLimitError('Erro na API do Claude: Rate limit exceeded');
                }

                // 3. Verificar erros de validação (400)
                if (error?.response?.status === 400) {
                    throw this.handleError(error);
                }

                // 4. Verificar erros de rede
                if (!error.response) {
                    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
                        throw new ClaudeTimeoutError('Erro ao comunicar com a API do Claude: Timeout');
                    }
                    if (error.message === 'Network Error') {
                        throw new ClaudeNetworkError('Erro ao comunicar com a API do Claude: Network Error');
                    }
                    throw new ClaudeNetworkError('Erro ao comunicar com a API do Claude');
                }

                // 5. Verificar resposta inválida/malformada
                if (error?.response?.data) {
                    if (!error.response.data.content || !error.response.data.role) {
                        throw new ClaudeResponseError('Erro na API do Claude: Resposta inválida');
                    }
                    if (Object.keys(error.response.data).length === 0) {
                        throw new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
                    }
                }

                // 6. Se for o último attempt, propaga o erro
                if (attempt === maxAttempts) {
                    throw this.handleError(error);
                }

                // 7. Calcula o delay com backoff exponencial
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
            }
        }

        throw new ClaudeResponseError('Erro na API do Claude: Número máximo de tentativas excedido');
    }

    async sendMessage(messages: ClaudeMessage[], systemPrompt?: string): Promise<ClaudeResponse> {
        const cacheKey = this.getCacheKey(messages, systemPrompt);
        const cachedResponse = await this.getFromCache(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const response = await this.executeWithRetry(async () => {
                const request: ClaudeRequest = {
                    model: this.defaultModel,
                    messages,
                    temperature: this.defaultTemperature,
                    max_tokens: this.defaultMaxTokens
                };

                if (systemPrompt) {
                    request.system = systemPrompt;
                }

                const response = await axios.post<ClaudeResponse>(
                    `${this.baseURL}/messages`,
                    request,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': this.apiKey,
                            'anthropic-version': '2023-06-01'
                        },
                        timeout: 30000
                    }
                );

                const validatedResponse = this.validateResponse(response);
                this.setInCache(cacheKey, validatedResponse);
                return validatedResponse;
            });

            return response;
        } catch (error: any) {
            // Se já for um erro conhecido, propaga
            if (error instanceof ClaudeRateLimitError ||
                error instanceof ClaudeTimeoutError ||
                error instanceof ClaudeNetworkError ||
                error instanceof ClaudeValidationError ||
                error instanceof ClaudeResponseError) {
                throw error;
            }
            throw this.handleError(error);
        }
    }

    async analyzeContext(content: string, history: ClaudeMessage[]): Promise<ClaudeResponse> {
        const systemPrompt = `Você é um assistente especializado em análise de contexto para documentação de projetos.
Analise a mensagem do usuário e identifique:
1. A fase do projeto mencionada (DVP, DRS, DAS, DADI)
2. Campos específicos mencionados e seus valores
3. Sugestões para próximas perguntas
4. Possíveis validações necessárias

Responda APENAS em formato JSON estruturado, sem texto adicional.`;

        try {
            const response = await this.sendMessage([...history, { role: 'user', content }], systemPrompt);
            
            try {
                // Validar se a resposta é um JSON válido
                JSON.parse(response.content);
                return response;
            } catch (parseError) {
                throw new ClaudeValidationError('Erro na API do Claude: Invalid system prompt');
            }
        } catch (e: any) {
            if (e instanceof ClaudeNetworkError || e instanceof ClaudeTimeoutError) {
                throw new ClaudeNetworkError('Erro ao comunicar com a API do Claude');
            }
            throw e;
        }
    }

    async generateResponse(content: string, analysis: string, history: ClaudeMessage[]): Promise<ClaudeResponse> {
        const systemPrompt = `Você é um assistente especializado em documentação de projetos.
Com base na análise de contexto fornecida e no histórico da conversa:
1. Gere uma resposta natural e empática
2. Demonstre compreensão do contexto atual
3. Faça perguntas relevantes para aprofundar o entendimento
4. Mantenha um tom profissional mas amigável

IMPORTANTE: Sua resposta deve ser em texto natural, NÃO em formato JSON.
Comece reconhecendo o que entendeu do usuário antes de fazer perguntas.`;

        const messages: ClaudeMessage[] = [
            ...history,
            { role: 'user', content },
            { role: 'assistant', content: `Análise de contexto: ${analysis}` }
        ];

        try {
            const response = await this.sendMessage(messages, systemPrompt);
            
            if (response.content.startsWith('{') || response.content.startsWith('[')) {
                throw new ClaudeValidationError('Erro na API do Claude: Invalid message content');
            }
            
            return response;
        } catch (e: any) {
            if (e instanceof ClaudeNetworkError || e instanceof ClaudeTimeoutError) {
                throw new ClaudeNetworkError('Erro ao comunicar com a API do Claude');
            }
            throw e;
        }
    }
} 