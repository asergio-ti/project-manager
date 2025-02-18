import React, { useState, Suspense, lazy } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileItem[];
}

// Função para carregar os protótipos dinamicamente
const loadPrototype = (path: string) => {
  // Remove a extensão .tsx do nome do arquivo
  const componentPath = path.replace(/\.tsx$/, '');
  // Carrega o componente dinamicamente usando import dinâmico
  return lazy(() => import(`@/components/prototypes/${componentPath}`));
};

const FileTreeItem = ({ 
  item, 
  level = 0,
  onFileClick,
  expandedDirs,
  onToggleDir
}: { 
  item: FileItem;
  level?: number;
  onFileClick: (file: FileItem) => void;
  expandedDirs: Set<string>;
  onToggleDir: (dir: string) => void;
}) => {
  const isExpanded = expandedDirs.has(item.path);
  const paddingLeft = level * 20;

  return (
    <div>
      <div 
        className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => item.type === 'directory' ? onToggleDir(item.path) : onFileClick(item)}
      >
        {item.type === 'directory' && (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )
        )}
        {item.type === 'directory' ? (
          <Folder className="w-5 h-5 mr-2 text-blue-500" />
        ) : (
          <FileCode className="w-5 h-5 mr-2 text-green-500" />
        )}
        <span>{item.name}</span>
      </div>
      
      {item.type === 'directory' && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem
              key={index}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
              expandedDirs={expandedDirs}
              onToggleDir={onToggleDir}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PrototypeExplorer() {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [Component, setComponent] = useState<any>(null);

  // Esta função seria substituída por uma que realmente lê o sistema de arquivos
  const getFileStructure = (): FileItem[] => {
    return [
      {
        name: 'chatConnect',
        type: 'directory',
        path: 'chatConnect',
        children: [
          { 
            name: 'ChatComponent.tsx', 
            type: 'file',
            path: 'chatConnect/ChatComponent'
          }
        ]
      }
    ];
  };

  const handleToggleDir = (dirPath: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };

  const handleFileClick = async (file: FileItem) => {
    setSelectedFile(file);
    try {
      const DynamicComponent = loadPrototype(file.path);
      setComponent(() => DynamicComponent);
    } catch (error) {
      console.error('Error loading component:', error);
      setComponent(null);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Navegador de Arquivos */}
      <Card className="w-64 p-4 h-full overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Protótipos</h2>
        <div className="border rounded">
          {getFileStructure().map((item, index) => (
            <FileTreeItem
              key={index}
              item={item}
              onFileClick={handleFileClick}
              expandedDirs={expandedDirs}
              onToggleDir={handleToggleDir}
            />
          ))}
        </div>
      </Card>

      {/* Área de Visualização */}
      <div className="flex-1 p-4">
        <Card className="h-full p-4">
          {selectedFile ? (
            <>
              <h2 className="text-lg font-semibold mb-4">{selectedFile.name}</h2>
              <div className="h-full">
                <Suspense fallback={<div>Carregando protótipo...</div>}>
                  {Component && <Component />}
                </Suspense>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Selecione um protótipo para visualizar</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}