import { Router, Request, Response } from 'express';
import { DocumentationServiceImpl } from '../services/documentation.service';
import { DocumentExportOptions } from '../types';

export class DocumentationController {
    private router: Router;
    private documentationService: DocumentationServiceImpl;

    constructor() {
        this.router = Router();
        this.documentationService = new DocumentationServiceImpl();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        // Rotas básicas de CRUD
        this.router.post('/', this.createDocument.bind(this));
        this.router.get('/:id', this.getDocument.bind(this));
        this.router.patch('/:id', this.updateDocument.bind(this));
        this.router.delete('/:id', this.deleteDocument.bind(this));

        // Rotas de seções
        this.router.post('/:id/sections', this.addSection.bind(this));
        this.router.patch('/:id/sections/:sectionId', this.updateSection.bind(this));
        this.router.delete('/:id/sections/:sectionId', this.removeSection.bind(this));

        // Rotas de versões
        this.router.post('/:id/versions', this.createVersion.bind(this));
        this.router.get('/:id/versions', this.listVersions.bind(this));
        this.router.get('/:id/versions/:version', this.getVersion.bind(this));

        // Rotas de exportação e validação
        this.router.post('/:id/export', this.exportDocument.bind(this));
        this.router.get('/:id/validate', this.validateDocument.bind(this));
        this.router.get('/:id/sections/:sectionId/validate', this.validateSection.bind(this));
    }

    private async createDocument(req: Request, res: Response): Promise<void> {
        try {
            const { projectId, phase, template } = req.body;

            if (!projectId || !phase) {
                res.status(400).json({ error: 'projectId e phase são obrigatórios' });
                return;
            }

            const document = await this.documentationService.createDocument(projectId, phase, template);
            res.status(201).json(document);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar documento' });
        }
    }

    private async getDocument(req: Request, res: Response): Promise<void> {
        try {
            const document = await this.documentationService.getDocument(req.params.id);
            res.json(document);
        } catch (error) {
            if (error instanceof Error && error.message === 'Documento não encontrado') {
                res.status(404).json({ error: 'Documento não encontrado' });
            } else {
                res.status(500).json({ error: 'Erro ao buscar documento' });
            }
        }
    }

    private async updateDocument(req: Request, res: Response): Promise<void> {
        try {
            const document = await this.documentationService.updateDocument(req.params.id, req.body);
            res.json(document);
        } catch (error) {
            if (error instanceof Error && error.message === 'Documento não encontrado') {
                res.status(404).json({ error: 'Documento não encontrado' });
            } else {
                res.status(500).json({ error: 'Erro ao atualizar documento' });
            }
        }
    }

    private async deleteDocument(req: Request, res: Response): Promise<void> {
        try {
            await this.documentationService.deleteDocument(req.params.id);
            res.status(204).send();
        } catch (error) {
            if (error instanceof Error && error.message === 'Documento não encontrado') {
                res.status(404).json({ error: 'Documento não encontrado' });
            } else {
                res.status(500).json({ error: 'Erro ao excluir documento' });
            }
        }
    }

    private async addSection(req: Request, res: Response): Promise<void> {
        try {
            const document = await this.documentationService.addSection(req.params.id, req.body);
            res.json(document);
        } catch (error) {
            if (error instanceof Error && error.message === 'Documento não encontrado') {
                res.status(404).json({ error: 'Documento não encontrado' });
            } else {
                res.status(500).json({ error: 'Erro ao adicionar seção' });
            }
        }
    }

    private async updateSection(req: Request, res: Response): Promise<void> {
        try {
            const document = await this.documentationService.updateSection(
                req.params.id,
                req.params.sectionId,
                req.body
            );
            res.json(document);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Documento não encontrado') {
                    res.status(404).json({ error: 'Documento não encontrado' });
                } else if (error.message === 'Seção não encontrada') {
                    res.status(404).json({ error: 'Seção não encontrada' });
                } else {
                    res.status(500).json({ error: 'Erro ao atualizar seção' });
                }
            }
        }
    }

    private async removeSection(req: Request, res: Response): Promise<void> {
        try {
            const document = await this.documentationService.removeSection(
                req.params.id,
                req.params.sectionId
            );
            res.json(document);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Documento não encontrado') {
                    res.status(404).json({ error: 'Documento não encontrado' });
                } else if (error.message === 'Seção não encontrada') {
                    res.status(404).json({ error: 'Seção não encontrada' });
                } else {
                    res.status(500).json({ error: 'Erro ao remover seção' });
                }
            }
        }
    }

    private async createVersion(req: Request, res: Response): Promise<void> {
        try {
            const { changes } = req.body;

            if (!changes || !Array.isArray(changes)) {
                res.status(400).json({ error: 'Lista de mudanças é obrigatória' });
                return;
            }

            const version = await this.documentationService.createVersion(req.params.id, changes);
            res.status(201).json(version);
        } catch (error) {
            if (error instanceof Error && error.message === 'Documento não encontrado') {
                res.status(404).json({ error: 'Documento não encontrado' });
            } else {
                res.status(500).json({ error: 'Erro ao criar versão' });
            }
        }
    }

    private async getVersion(req: Request, res: Response): Promise<void> {
        try {
            const version = await this.documentationService.getVersion(
                req.params.id,
                req.params.version
            );
            res.json(version);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Nenhuma versão encontrada para este documento') {
                    res.status(404).json({ error: 'Nenhuma versão encontrada' });
                } else if (error.message === 'Versão não encontrada') {
                    res.status(404).json({ error: 'Versão não encontrada' });
                } else {
                    res.status(500).json({ error: 'Erro ao buscar versão' });
                }
            }
        }
    }

    private async listVersions(req: Request, res: Response): Promise<void> {
        try {
            const versions = await this.documentationService.listVersions(req.params.id);
            res.json(versions);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar versões' });
        }
    }

    private async exportDocument(req: Request, res: Response): Promise<void> {
        try {
            const options: DocumentExportOptions = {
                format: req.body.format || 'pdf',
                includeMetadata: req.body.includeMetadata ?? true,
                includeSections: req.body.includeSections,
                styleTemplate: req.body.styleTemplate,
                watermark: req.body.watermark
            };

            const buffer = await this.documentationService.exportDocument(req.params.id, options);
            
            res.setHeader('Content-Type', this.getContentType(options.format));
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="document.${options.format}"`
            );
            res.send(buffer);
        } catch (error) {
            if (error instanceof Error && error.message === 'Documento não encontrado') {
                res.status(404).json({ error: 'Documento não encontrado' });
            } else {
                res.status(500).json({ error: 'Erro ao exportar documento' });
            }
        }
    }

    private async validateDocument(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.documentationService.validateDocument(req.params.id);
            res.json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Documento não encontrado') {
                res.status(404).json({ error: 'Documento não encontrado' });
            } else {
                res.status(500).json({ error: 'Erro ao validar documento' });
            }
        }
    }

    private async validateSection(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.documentationService.validateSection(
                req.params.id,
                req.params.sectionId
            );
            res.json(result);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Documento não encontrado') {
                    res.status(404).json({ error: 'Documento não encontrado' });
                } else if (error.message === 'Seção não encontrada') {
                    res.status(404).json({ error: 'Seção não encontrada' });
                } else {
                    res.status(500).json({ error: 'Erro ao validar seção' });
                }
            }
        }
    }

    private getContentType(format: string): string {
        switch (format) {
            case 'pdf':
                return 'application/pdf';
            case 'html':
                return 'text/html';
            case 'markdown':
                return 'text/markdown';
            case 'word':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default:
                return 'application/octet-stream';
        }
    }

    getRouter(): Router {
        return this.router;
    }
} 