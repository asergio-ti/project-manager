import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, projectService } from '../../services/ProjectService';
import { useProject } from '../../contexts/ProjectContext';
import { Spinner } from '../ui/Spinner';
import { ErrorMessage } from '../ui/ErrorMessage';

/**
 * ProjectList é o componente principal da tela inicial.
 * Exibe uma lista de projetos disponíveis no workspace com seus respectivos status.
 * 
 * Funcionalidades:
 * - Carrega e exibe todos os projetos disponíveis
 * - Mostra o status de cada fase dos projetos
 * - Permite navegação para um projeto específico
 * - Gerencia estados de loading e erro
 * 
 * @component
 */
const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentProject } = useProject();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setError(null);
      const projectList = await projectService.listProjects();
      setProjects(projectList);
    } catch (err) {
      setError('Erro ao carregar projetos. Tente novamente mais tarde.');
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    navigate(`/project/${project.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Selecione um Projeto</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => handleProjectSelect(project)}
          >
            <h2 className="text-xl font-semibold text-card-foreground mb-4">{project.name}</h2>
            
            <div className="space-y-2">
              {Object.entries(project.phases).map(([phaseId, phase]) => (
                <div key={phaseId} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{phase.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    phase.status === 'completed'
                      ? 'bg-primary/10 text-primary'
                      : phase.status === 'in_progress'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {phase.status === 'completed' ? 'Concluído' :
                     phase.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList; 