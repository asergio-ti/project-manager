import { Phase, ProgressState, TimelineState } from '../types/project';

export interface Project {
  id: string;
  name: string;
  path: string;
  phases: {
    dvp: Phase;
    drs: Phase;
    das: Phase;
    dadi: Phase;
  };
}

class ProjectService {
  private baseUrl = 'http://localhost:3001/workspace/projects';

  async listProjects(): Promise<Project[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error('Falha ao carregar projetos');
      }
      const projects = await response.json();
      return projects;
    } catch (error) {
      console.error('Erro ao listar projetos:', error);
      return [];
    }
  }

  async getProjectMetadata(projectId: string): Promise<ProgressState | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/metadata/progress.json`);
      if (!response.ok) {
        throw new Error('Falha ao carregar metadados do projeto');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar metadados:', error);
      return null;
    }
  }

  async getProjectTimeline(projectId: string): Promise<TimelineState | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/metadata/timeline.json`);
      if (!response.ok) {
        throw new Error('Falha ao carregar timeline do projeto');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar timeline:', error);
      return null;
    }
  }
}

export const projectService = new ProjectService(); 