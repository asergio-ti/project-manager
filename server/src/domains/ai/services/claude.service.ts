import axios from 'axios';
import { 
    ClaudeMessage, 
    ClaudeRequest, 
    ClaudeResponse, 
    ClaudeError 
} from '../types/claude.types';
import { AIServiceConfig } from '../types';

export class ClaudeService {
    private readonly apiKey: string;
    private readonly baseURL = 'https://api.anthropic.com/v1';
    private readonly defaultModel: string;
    private readonly defaultTemperature: number;
    private readonly defaultMaxTokens: number;

    constructor(config: AIServiceConfig) {
        this.apiKey = config.apiKey;
        this.defaultModel = config.model;
        this.defaultTemperature = config.temperature;
        this.defaultMaxTokens = config.maxTokens;

        if (!this.apiKey) {
            throw new Error('API Key do Claude não configurada');
        }
    }

    async sendMessage(messages: ClaudeMessage[], systemPrompt?: string): Promise<ClaudeResponse> {
        try {
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
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            if (error?.response?.data) {
                const claudeError = error.response.data as ClaudeError;
                throw new Error(`Erro na API do Claude: ${claudeError.message}`);
            }
            throw new Error('Erro ao comunicar com a API do Claude');
        }
    }

    async analyzeContext(content: string, history: ClaudeMessage[]): Promise<ClaudeResponse> {
        const systemPrompt = `Você é um assistente especializado em análise de contexto para documentação de projetos.
Analise a mensagem do usuário e identifique:
1. A fase do projeto mencionada (DVP, DRS, DAS, DADI)
2. Campos específicos mencionados e seus valores
3. Sugestões para próximas perguntas
4. Possíveis validações necessárias

Responda em formato JSON estruturado.`;

        return this.sendMessage([...history, { role: 'user', content }], systemPrompt);
    }

    async generateResponse(content: string, analysis: string, history: ClaudeMessage[]): Promise<ClaudeResponse> {
        const systemPrompt = `Você é um assistente especializado em documentação de projetos.
Com base na análise de contexto fornecida e no histórico da conversa:
1. Gere uma resposta natural e útil
2. Faça perguntas relevantes para coletar mais informações
3. Sugira próximos passos quando apropriado
4. Mantenha um tom profissional mas amigável`;

        const messages: ClaudeMessage[] = [
            ...history,
            { role: 'user', content },
            { role: 'assistant', content: `Análise de contexto: ${analysis}` }
        ];

        return this.sendMessage(messages, systemPrompt);
    }
} 