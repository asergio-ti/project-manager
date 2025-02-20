import express from 'express';
import path from 'path';
import { readdir, readFile } from 'fs/promises';

interface Document {
  schema: string;
  completion: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Phase {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  documents: Document[];
}

interface ProjectPhases {
  [key: string]: Phase;
}

interface Project {
  id: string;
  name: string;
  path: string;
  phases: ProjectPhases;
}

interface ProgressPhase {
  status: 'pending' | 'in_progress' | 'completed';
}

interface Progress {
  phases: {
    [key: string]: ProgressPhase;
  };
}

const app = express();
const port = 3001;

// Middleware para CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://curly-dollop-9pg67x7x5g4hxjgx-3000.app.github.dev'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Rota para listar projetos
app.get('/workspace/projects', async (req, res) => {
  try {
    const workspacePath = path.join(__dirname, '..', 'workspace', 'projects');
    const projects = await readdir(workspacePath);
    
    const projectList = await Promise.all(projects.map(async (projectName) => {
      const projectPath = path.join(workspacePath, projectName);
      const metadata: Project = {
        id: projectName,
        name: projectName,
        path: projectPath,
        phases: {
          dvp: { id: 'dvp', name: 'DVP', status: 'pending', documents: [] },
          drs: { id: 'drs', name: 'DRS', status: 'pending', documents: [] },
          das: { id: 'das', name: 'DAS', status: 'pending', documents: [] },
          dadi: { id: 'dadi', name: 'DADI', status: 'pending', documents: [] }
        }
      };

      try {
        const progressData = await readFile(path.join(projectPath, 'metadata', 'progress.json'), 'utf-8');
        const progress: Progress = JSON.parse(progressData);
        // Atualizar fases com dados do progress.json
        Object.entries(progress.phases).forEach(([phaseId, phaseData]) => {
          if (phaseId in metadata.phases) {
            metadata.phases[phaseId].status = phaseData.status;
          }
        });
      } catch (error) {
        console.warn(`Arquivo progress.json não encontrado para ${projectName}`);
      }

      return metadata;
    }));

    res.json(projectList);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
});

// Rota para obter metadados do projeto
app.get('/workspace/projects/:projectId/metadata/:file', async (req, res) => {
  try {
    const { projectId, file } = req.params;
    const filePath = path.join(__dirname, '..', 'workspace', 'projects', projectId, 'metadata', file);
    const data = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Erro ao ler arquivo:', error);
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 