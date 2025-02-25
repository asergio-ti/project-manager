import { Request, Response, NextFunction } from 'express';
import { AIController } from '../ai.controller';
import { AIService } from '../../services/ai.service';
import { ConversationState, ChatMessage } from '../../types';

// Mock do AIService
jest.mock('../../services/ai.service');
const MockedAIService = AIService as jest.MockedClass<typeof AIService>;

describe('AIController', () => {
    let controller: AIController;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let jsonSpy: jest.Mock;
    let statusSpy: jest.Mock;

    beforeEach(() => {
        // Reset dos mocks
        jest.clearAllMocks();

        // Setup dos mocks do Express
        jsonSpy = jest.fn();
        statusSpy = jest.fn().mockReturnThis();
        mockRes = {
            json: jsonSpy,
            status: statusSpy
        };
        mockNext = jest.fn();

        // Criar controller
        controller = new AIController();
    });

    describe('POST /conversations', () => {
        const mockProjectId = 'project-123';
        const mockPhase = 'DVP';

        beforeEach(() => {
            mockReq = {
                body: { projectId: mockProjectId, phase: mockPhase }
            };
        });

        it('deve criar uma nova conversa com sucesso', async () => {
            const mockConversation: Partial<ConversationState> = {
                projectId: mockProjectId,
                currentPhase: mockPhase,
                messages: [],
                context: { completedFields: [], pendingFields: [] }
            };

            MockedAIService.prototype.startConversation.mockResolvedValueOnce(mockConversation as ConversationState);

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(201);
            expect(jsonSpy).toHaveBeenCalledWith(mockConversation);
            expect(MockedAIService.prototype.startConversation)
                .toHaveBeenCalledWith(mockProjectId, mockPhase);
        });

        it('deve retornar erro 400 se projectId não for fornecido', async () => {
            mockReq.body = { phase: mockPhase };

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith({
                error: 'projectId e phase são obrigatórios'
            });
        });

        it('deve retornar erro 400 se phase não for fornecida', async () => {
            mockReq.body = { projectId: mockProjectId };

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith({
                error: 'projectId e phase são obrigatórios'
            });
        });

        it('deve retornar erro 500 se houver erro ao criar conversa', async () => {
            MockedAIService.prototype.startConversation.mockRejectedValueOnce(
                new Error('Erro interno')
            );

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(500);
            expect(jsonSpy).toHaveBeenCalledWith({
                error: 'Erro ao iniciar conversa'
            });
        });
    });

    describe('POST /conversations/:projectId/messages', () => {
        const mockProjectId = 'project-123';
        const mockContent = 'Como começo a documentação?';

        beforeEach(() => {
            mockReq = {
                params: { projectId: mockProjectId },
                body: { content: mockContent }
            };
        });

        it('deve processar mensagem com sucesso', async () => {
            const mockResponse: Partial<ChatMessage> = {
                id: 'msg-123',
                role: 'assistant',
                content: 'Vamos começar pela visão geral.',
                timestamp: new Date(),
                context: {
                    projectId: mockProjectId,
                    phase: 'DVP'
                }
            };

            MockedAIService.prototype.processMessage.mockResolvedValueOnce(mockResponse as ChatMessage);

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations/:projectId/messages')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(jsonSpy).toHaveBeenCalledWith(mockResponse);
            expect(MockedAIService.prototype.processMessage)
                .toHaveBeenCalledWith(mockProjectId, mockContent);
        });

        it('deve retornar erro 400 se content não for fornecido', async () => {
            mockReq.body = {};

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations/:projectId/messages')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith({
                error: 'Conteúdo da mensagem é obrigatório'
            });
        });

        it('deve retornar erro 404 se conversa não for encontrada', async () => {
            MockedAIService.prototype.processMessage.mockRejectedValueOnce(
                new Error('Conversa não encontrada')
            );

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations/:projectId/messages')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(404);
            expect(jsonSpy).toHaveBeenCalledWith({
                error: 'Conversa não encontrada'
            });
        });

        it('deve retornar erro 500 se houver erro ao processar mensagem', async () => {
            MockedAIService.prototype.processMessage.mockRejectedValueOnce(
                new Error('Erro interno')
            );

            await controller['router'].stack
                .find(layer => layer.route?.path === '/conversations/:projectId/messages')
                ?.route?.stack[0].handle(mockReq as Request, mockRes as Response, mockNext);

            expect(statusSpy).toHaveBeenCalledWith(500);
            expect(jsonSpy).toHaveBeenCalledWith({
                error: 'Erro ao processar mensagem'
            });
        });
    });
}); 