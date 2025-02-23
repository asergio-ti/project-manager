import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/project.service';

export class ProjectController {
    private router: Router;
    private projectService: ProjectService;

    constructor() {
        this.router = Router();
        this.projectService = new ProjectService();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        // Listar projetos
        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const projects = await this.projectService.listProjects();
                res.json(projects);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao listar projetos' });
            }
        });

        // Obter projeto específico
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const project = await this.projectService.getProject(req.params.id);
                if (!project) {
                    return res.status(404).json({ error: 'Projeto não encontrado' });
                }
                res.json(project);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao buscar projeto' });
            }
        });

        // Criar novo projeto
        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const { name, description } = req.body;
                if (!name) {
                    return res.status(400).json({ error: 'Nome é obrigatório' });
                }
                const project = await this.projectService.createProject(name, description);
                res.status(201).json(project);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao criar projeto' });
            }
        });

        // Atualizar projeto
        this.router.patch('/:id', async (req: Request, res: Response) => {
            try {
                const project = await this.projectService.updateProject(req.params.id, req.body);
                if (!project) {
                    return res.status(404).json({ error: 'Projeto não encontrado' });
                }
                res.json(project);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao atualizar projeto' });
            }
        });

        // Atualizar fase do projeto
        this.router.patch('/:id/phases/:phase', async (req: Request, res: Response) => {
            try {
                const { id, phase } = req.params;
                const project = await this.projectService.updatePhase(id, phase as any, req.body);
                if (!project) {
                    return res.status(404).json({ error: 'Projeto não encontrado' });
                }
                res.json(project);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao atualizar fase do projeto' });
            }
        });
    }

    getRouter(): Router {
        return this.router;
    }
} 