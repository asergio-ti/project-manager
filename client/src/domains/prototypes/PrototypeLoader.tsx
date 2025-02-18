import React from 'react';
import { useParams, Link } from 'react-router-dom';

interface Prototype {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  path: string;
}

export const PrototypeLoader: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [prototypes, setPrototypes] = React.useState<Prototype[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadPrototypes = async () => {
      try {
        // Usando o path configurado no webpack
        const prototypeModule = await import(
          `@managed-projects/${projectId}/prototypes/react/src/prototypes`
        );
        
        if (!prototypeModule || !prototypeModule.default) {
          throw new Error('Nenhum protótipo encontrado neste projeto');
        }

        setPrototypes(prototypeModule.default);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar protótipos:', err);
        setError('Erro ao carregar protótipos. Verifique se o projeto possui protótipos React.');
        setLoading(false);
      }
    };

    loadPrototypes();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Carregando protótipos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-8">
            <Link
              to="/"
              className="mr-4 px-4 py-2 bg-card rounded-lg shadow-sm hover:bg-muted transition-colors text-muted-foreground"
            >
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              Protótipos - {projectId}
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prototypes.map((prototype) => (
              <Link
                key={prototype.id}
                to={`/projects/${projectId}/prototypes/${prototype.id}`}
                className="block p-6 bg-card rounded-lg border border-border shadow-sm hover:bg-muted/50 transition-colors"
              >
                <h2 className="text-xl font-bold text-card-foreground mb-2">
                  {prototype.name}
                </h2>
                <p className="text-muted-foreground">{prototype.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 