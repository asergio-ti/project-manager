import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SplitLayout from './components/Layout/SplitLayout';
import Timeline from './components/Layout/Timeline';
import ChatInterface from './components/Layout/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-full">
        <Routes>
          <Route path="/" element={
            <SplitLayout
              leftPanel={<Timeline />}
              rightPanel={<ChatInterface />}
            />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default App; 