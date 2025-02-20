import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SplitLayout from './components/Layout/SplitLayout';
import Timeline from './components/Layout/Timeline';
import ChatInterface from './components/Chat/ChatInterface';
import ProjectList from './components/ProjectList/ProjectList';
import { ProjectProvider } from './contexts/ProjectContext';
import { ChatProvider } from './contexts/ChatContext';

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <ChatProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Rota inicial - Lista de Projetos */}
            <Route path="/" element={<ProjectList />} />
            
            {/* Rota do Projeto */}
            <Route path="/project/:projectId" element={
              <div className="h-full">
                <SplitLayout
                  leftPanel={<Timeline />}
                  rightPanel={<ChatInterface />}
                />
              </div>
            } />
          </Routes>
        </div>
      </ChatProvider>
    </ProjectProvider>
  );
};

export default App; 