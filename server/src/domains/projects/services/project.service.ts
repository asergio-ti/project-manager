import { Project, PhaseState, ProjectStatus } from '../types';

export class ProjectService {
    private projects: Map<string, Project> = new Map();

    async createProject(name: string, description?: string): Promise<Project> {
        const project: Project = {
            id: Date.now().toString(),
            name,
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            phases: {
                dvp: this.createInitialPhaseState(),
                drs: this.createInitialPhaseState(),
                das: this.createInitialPhaseState(),
                dadi: this.createInitialPhaseState()
            },
            status: {
                currentPhase: 'DVP',
                overallProgress: 0,
                startDate: new Date(),
                lastActivity: new Date()
            },
            metadata: {
                createdBy: 'system' // TODO: Implementar autenticação
            }
        };

        this.projects.set(project.id, project);
        return project;
    }

    async getProject(id: string): Promise<Project | null> {
        return this.projects.get(id) || null;
    }

    async listProjects(): Promise<Project[]> {
        return Array.from(this.projects.values());
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
        const project = this.projects.get(id);
        if (!project) return null;

        const updatedProject = {
            ...project,
            ...updates,
            updatedAt: new Date(),
            version: project.version + 1
        };

        this.projects.set(id, updatedProject);
        return updatedProject;
    }

    async updatePhase(projectId: string, phase: keyof Project['phases'], updates: Partial<PhaseState>): Promise<Project | null> {
        const project = this.projects.get(projectId);
        if (!project) return null;

        const updatedPhase = {
            ...project.phases[phase],
            ...updates,
            lastUpdate: new Date()
        };

        const updatedProject = {
            ...project,
            phases: {
                ...project.phases,
                [phase]: updatedPhase
            },
            updatedAt: new Date(),
            version: project.version + 1
        };

        // Atualizar progresso geral
        updatedProject.status.overallProgress = this.calculateOverallProgress(updatedProject);
        updatedProject.status.lastActivity = new Date();

        this.projects.set(projectId, updatedProject);
        return updatedProject;
    }

    private createInitialPhaseState(): PhaseState {
        return {
            status: 'not_started',
            progress: 0,
            completedFields: [],
            pendingFields: [],
            lastUpdate: new Date()
        };
    }

    private calculateOverallProgress(project: Project): number {
        const phases = Object.values(project.phases);
        const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
        return totalProgress / phases.length;
    }
} 