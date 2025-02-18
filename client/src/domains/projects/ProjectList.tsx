import React from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  features: {
    type: 'prototypes' | 'docs';
    path: string;
    available: boolean;
  }[];
}

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    // Simular carregamento de projetos - será substituído pela leitura real do diretório
    setProjects([
      {
        id: 'chatConnect',
        name: 'Chat Connect',
        features: [
          { type: 'prototypes', path: '/projects/chatConnect/prototypes', available: true },
          { type: 'docs', path: '/projects/chatConnect/docs', available: true }
        ]
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Project Manager
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="block p-6 bg-card rounded-lg border border-border shadow-sm"
              >
                <h2 className="text-xl font-bold text-card-foreground mb-4">
                  {project.name}
                </h2>
                <div className="space-y-2">
                  {project.features.map((feature) => (
                    <Link
                      key={feature.type}
                      to={feature.path}
                      className={`block p-2 rounded ${
                        feature.available
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {feature.type.charAt(0).toUpperCase() + feature.type.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 