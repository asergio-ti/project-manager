import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Importar controllers
import { ProjectController } from './domains/projects/controllers/project.controller';
import { AIController } from './domains/ai/controllers/ai.controller';
import { DocumentationController } from './domains/documentation/controllers/documentation.controller';

// Importar rotas
import schemaRoutes from './routes/schemas';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rota básica para teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rotas da API
app.use('/api/schemas', schemaRoutes);

// Configurar rotas
const projectController = new ProjectController();
const aiController = new AIController();
const documentationController = new DocumentationController();

app.use('/api/projects', projectController.getRouter());
app.use('/api/ai', aiController.getRouter());
app.use('/api/docs', documentationController.getRouter());

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});