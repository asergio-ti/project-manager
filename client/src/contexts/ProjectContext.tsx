import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, projectService } from '../services/ProjectService';
import { ProgressState, TimelineState } from '../types/project';

interface ProjectContextData {
  currentProject: Project | null;
  projectMetadata: ProgressState | null;
  projectTimeline: TimelineState | null;
  loading: boolean;
  error: string | null;
  setCurrentProject: (project: Project) => void;
  loadProjectData: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextData>({} as ProjectContextData);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectMetadata, setProjectMetadata] = useState<ProgressState | null>(null);
  const [projectTimeline, setProjectTimeline] = useState<TimelineState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjectData = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [metadata, timeline] = await Promise.all([
        projectService.getProjectMetadata(projectId),
        projectService.getProjectTimeline(projectId)
      ]);

      setProjectMetadata(metadata);
      setProjectTimeline(timeline);
    } catch (err) {
      setError('Erro ao carregar dados do projeto');
      console.error('Erro ao carregar dados do projeto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projectMetadata,
        projectTimeline,
        loading,
        error,
        setCurrentProject,
        loadProjectData
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject deve ser usado dentro de um ProjectProvider');
  }
  return context;
}; 