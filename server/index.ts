import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Rota para listar projetos
app.get('/workspace/projects', async (req, res) => {
  try {
    const workspacePath = join(__dirname, '..', 'workspace', 'projects');
    const projects = await readdir(workspacePath);
    
    const projectList = await Promise.all(projects.map(async (projectName) => {
      const projectPath = join(workspacePath, projectName);
      const metadata = {
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
        const progressData = await readFile(join(projectPath, 'metadata', 'progress.json'), 'utf-8');
        const progress = JSON.parse(progressData);
        // Atualizar fases com dados do progress.json
        Object.entries(progress.phases).forEach(([phaseId, phaseData]: [string, any]) => {
          if (metadata.phases[phaseId]) {
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
    const filePath = join(__dirname, '..', 'workspace', 'projects', projectId, 'metadata', file);
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