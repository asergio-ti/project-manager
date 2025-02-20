// Layout dividido com timeline e chat

import React, { ReactNode } from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface SplitLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ leftPanel, rightPanel }) => {
  return (
    <div className="h-screen bg-background p-4 flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Project Manager</h1>
      </header>
      
      <div className="flex-1 flex space-x-4">
        {/* Painel Esquerdo - Timeline */}
        <div className="w-1/2 h-full">
          {leftPanel}
        </div>

        {/* Divisor Redimensionável */}
        <ResizableBox
          width={4}
          height={Infinity}
          axis="x"
          resizeHandles={['e']}
          minConstraints={[4, Infinity]}
          maxConstraints={[4, Infinity]}
          className="bg-border hover:bg-primary/50 transition-colors cursor-col-resize"
        />

        {/* Painel Direito - Chat */}
        <div className="flex-1 h-full">
          {rightPanel}
        </div>
      </div>
    </div>
  );
};

export default SplitLayout;
