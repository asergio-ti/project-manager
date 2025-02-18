import React from 'react';
import { Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Project Manager
          </h1>
          <Routes>
            <Route path="/" element={<div>Bem-vindo ao Project Manager!</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App; 