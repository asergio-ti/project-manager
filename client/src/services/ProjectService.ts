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
  private baseUrl: string;

  constructor() {
    // Determina a URL base com base no ambiente
    const isCodespace = window.location.hostname.includes('github.dev');
    const hostname = window.location.hostname;
    
    if (isCodespace) {
      // Extrai o identificador do Codespace do hostname atual
      // Format: curly-dollop-9pg67x7x5g4hxjgx-3000.app.github.dev
      const parts = hostname.split('.');
      const prefix = parts[0]; // curly-dollop-9pg67x7x5g4hxjgx-3000
      const serverPrefix = prefix.replace('-3000', '-3001'); // substitui a porta
      this.baseUrl = `https://${serverPrefix}.${parts.slice(1).join('.')}/workspace/projects`;
    } else {
      this.baseUrl = 'http://localhost:3001/workspace/projects';
    }
    
    console.log('ProjectService inicializado com:');
    console.log('- Hostname atual:', hostname);
    console.log('- É Codespace?', isCodespace);
    console.log('- URL base:', this.baseUrl);
  }

  async listProjects(): Promise<Project[]> {
    console.log('Listando projetos...');
    try {
      console.log('Fazendo requisição para:', this.baseUrl);
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resposta não ok:', response.status, errorText);
        throw new Error('Falha ao carregar projetos');
      }
      
      const projects = await response.json();
      console.log('Projetos recebidos:', projects);
      return projects;
    } catch (error) {
      console.error('Erro detalhado ao listar projetos:', error);
      return [];
    }
  }

  async getProjectMetadata(projectId: string): Promise<ProgressState | null> {
    console.log('Buscando metadados do projeto:', projectId);
    try {
      const url = `${this.baseUrl}/${projectId}/metadata/progress.json`;
      console.log('Fazendo requisição para:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resposta não ok:', response.status, errorText);
        throw new Error('Falha ao carregar metadados do projeto');
      }
      
      const data = await response.json();
      console.log('Metadados recebidos:', data);
      return data;
    } catch (error) {
      console.error('Erro detalhado ao carregar metadados:', error);
      return null;
    }
  }

  async getProjectTimeline(projectId: string): Promise<TimelineState | null> {
    console.log('Buscando timeline do projeto:', projectId);
    try {
      const url = `${this.baseUrl}/${projectId}/metadata/timeline.json`;
      console.log('Fazendo requisição para:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resposta não ok:', response.status, errorText);
        throw new Error('Falha ao carregar timeline do projeto');
      }
      
      const data = await response.json();
      console.log('Timeline recebida:', data);
      return data;
    } catch (error) {
      console.error('Erro detalhado ao carregar timeline:', error);
      return null;
    }
  }
}

export const projectService = new ProjectService(); 