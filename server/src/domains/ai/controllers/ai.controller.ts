import { Router, Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { AIServiceConfig } from '../types';

export class AIController {
    private router: Router;
    private aiService: AIService;

    constructor() {
        this.router = Router();
        
        // TODO: Carregar configuração do ambiente
        const config: AIServiceConfig = {
            model: 'claude-3-sonnet',
            temperature: 0.7,
            maxTokens: 2000,
            apiKey: process.env.CLAUDE_API_KEY || ''
        };
        
        this.aiService = new AIService(config);
        this.setupRoutes();
    }

    private setupRoutes(): void {
        // Iniciar nova conversa
        this.router.post('/conversations', async (req: Request, res: Response) => {
            try {
                const { projectId, phase } = req.body;
                
                if (!projectId || !phase) {
                    return res.status(400).json({ 
                        error: 'projectId e phase são obrigatórios' 
                    });
                }

                const conversation = await this.aiService.startConversation(projectId, phase);
                res.status(201).json(conversation);
            } catch (error) {
                res.status(500).json({ 
                    error: 'Erro ao iniciar conversa' 
                });
            }
        });

        // Enviar mensagem
        this.router.post('/conversations/:projectId/messages', async (req: Request, res: Response) => {
            try {
                const { projectId } = req.params;
                const { content } = req.body;

                if (!content) {
                    return res.status(400).json({ 
                        error: 'Conteúdo da mensagem é obrigatório' 
                    });
                }

                const response = await this.aiService.processMessage(projectId, content);
                res.json(response);
            } catch (error) {
                if (error instanceof Error && error.message === 'Conversa não encontrada') {
                    res.status(404).json({ 
                        error: 'Conversa não encontrada' 
                    });
                } else {
                    res.status(500).json({ 
                        error: 'Erro ao processar mensagem' 
                    });
                }
            }
        });
    }

    getRouter(): Router {
        return this.router;
    }
} 