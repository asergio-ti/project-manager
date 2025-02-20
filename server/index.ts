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
    'https://curly-dollop-9pg67x7x5g4hxjgx-3000.app.github.dev',
    'https://curly-dollop-9pg67x7x5g4hxjgx.github.dev'
  ];
  
  const origin = req.headers.origin;
  console.log('Requisição recebida de:', origin);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('CORS permitido para:', origin);
  } else {
    console.log('Origem não permitida:', origin);
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Rota para listar projetos
app.get('/workspace/projects', async (req, res) => {
  console.log('GET /workspace/projects - Iniciando busca de projetos');
  try {
    const workspacePath = path.join(__dirname, '..', 'workspace', 'projects');
    console.log('Buscando projetos em:', workspacePath);
    
    const projects = await readdir(workspacePath);
    console.log('Projetos encontrados:', projects);
    
    const projectList = await Promise.all(projects.map(async (projectName) => {
      console.log('Processando projeto:', projectName);
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
        const progressPath = path.join(projectPath, 'metadata', 'progress.json');
        console.log('Tentando ler progress.json de:', progressPath);
        
        const progressData = await readFile(progressPath, 'utf-8');
        const progress: Progress = JSON.parse(progressData);
        console.log('Dados de progresso encontrados para:', projectName);
        
        Object.entries(progress.phases).forEach(([phaseId, phaseData]) => {
          if (phaseId in metadata.phases) {
            metadata.phases[phaseId].status = phaseData.status;
          }
        });
      } catch (error) {
        console.warn(`Arquivo progress.json não encontrado para ${projectName}:`, error);
      }

      return metadata;
    }));

    console.log('Lista de projetos processada com sucesso');
    res.json(projectList);
  } catch (error) {
    console.error('Erro detalhado ao listar projetos:', error);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
});

// Rota para obter metadados do projeto
app.get('/workspace/projects/:projectId/metadata/:file', async (req, res) => {
  const { projectId, file } = req.params;
  console.log(`GET /workspace/projects/${projectId}/metadata/${file} - Buscando metadados`);
  
  try {
    const filePath = path.join(__dirname, '..', 'workspace', 'projects', projectId, 'metadata', file);
    console.log('Tentando ler arquivo:', filePath);
    
    const data = await readFile(filePath, 'utf-8');
    console.log('Arquivo lido com sucesso');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Erro detalhado ao ler arquivo:', error);
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

// Rota raiz para teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor do Project Manager está funcionando!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log('Diretório atual:', __dirname);
  console.log('Origens permitidas:', [
    'http://localhost:3000',
    'https://curly-dollop-9pg67x7x5g4hxjgx-3000.app.github.dev',
    'https://curly-dollop-9pg67x7x5g4hxjgx.github.dev'
  ]);
}); 