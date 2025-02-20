import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from './ProjectList';
import { ProjectProvider } from '../../contexts/ProjectContext';
import { projectService } from '../../services/ProjectService';

// Mock do serviço
jest.mock('../../services/ProjectService', () => ({
  projectService: {
    listProjects: jest.fn()
  }
}));

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('ProjectList', () => {
  const mockProjects = [
    {
      id: 'project-1',
      name: 'Projeto 1',
      path: '/path/to/project1',
      phases: {
        dvp: { id: 'dvp', name: 'DVP', status: 'completed', documents: [] },
        drs: { id: 'drs', name: 'DRS', status: 'in_progress', documents: [] },
        das: { id: 'das', name: 'DAS', status: 'pending', documents: [] },
        dadi: { id: 'dadi', name: 'DADI', status: 'pending', documents: [] }
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve mostrar loading ao iniciar', () => {
    (projectService.listProjects as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <BrowserRouter>
        <ProjectProvider>
          <ProjectList />
        </ProjectProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('deve mostrar a lista de projetos quando carregada com sucesso', async () => {
    (projectService.listProjects as jest.Mock).mockResolvedValue(mockProjects);

    render(
      <BrowserRouter>
        <ProjectProvider>
          <ProjectList />
        </ProjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Projeto 1')).toBeInTheDocument();
    });
  });

  it('deve mostrar erro quando falhar ao carregar projetos', async () => {
    (projectService.listProjects as jest.Mock).mockRejectedValue(
      new Error('Erro ao carregar')
    );

    render(
      <BrowserRouter>
        <ProjectProvider>
          <ProjectList />
        </ProjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar projetos/i)).toBeInTheDocument();
    });
  });

  it('deve navegar para o projeto ao clicar', async () => {
    (projectService.listProjects as jest.Mock).mockResolvedValue(mockProjects);

    render(
      <BrowserRouter>
        <ProjectProvider>
          <ProjectList />
        </ProjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const projectCard = screen.getByText('Projeto 1');
      fireEvent.click(projectCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/project/project-1');
  });
}); 