import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ChatMinimal from './ChatMinimal';
import ChatComponent from './chat-component';
import ChatEmpresarial from './chat-empresarial';
import BrandDemoComponent from './brand-demo-component-v1';
import DeliveryDashboard from './delivery-dashboard';
import DeliveryCall from './delivery-call';
import DeliveryNavigation from './delivery-navigation';
import FileExplorerDynamic from './file-explorer-dynamic';
import FunctionalWorkflow from './functional-workflow-1';
import LoginComponent from './login-component';

// Interface para registrar protótipos
export interface Prototype {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  path: string;
}

// Tipagem para o require.context
declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): {
    keys(): string[];
    (id: string): any;
  };
};

// Importar automaticamente todos os protótipos
const prototypeContext = require.context('./', true, /\.(tsx|jsx)$/);
const prototypes: Prototype[] = prototypeContext.keys()
  .filter((key: string) => {
    // Excluir o próprio index e arquivos que não são componentes
    return !key.includes('index.tsx') && 
           !key.includes('/ui/') && 
           !key.includes('.test.') &&
           !key.includes('.spec.') &&
           !key.includes('/types/') &&
           !key.includes('/utils/');
  })
  .map((key: string) => {
    // Remover ./ do início e .tsx do final
    const componentName = key
      .replace(/^\.\//, '')
      .replace(/\.(tsx|jsx)$/, '');
    
    const component = prototypeContext(key).default;
    
    // Converter de kebab-case ou snake_case para Title Case
    const formatName = (str: string) => {
      return str
        .split('/')
        .pop()!
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return {
      id: componentName,
      name: formatName(componentName),
      description: `Protótipo do ${formatName(componentName)}`,
      component,
      path: `/${componentName}`
    };
  })
  .filter((proto: Partial<Prototype>) => proto.component); // Filtrar apenas componentes válidos

// Adicionar log para debug
console.log('Protótipos encontrados:', prototypes.map(p => p.name));

// Componente de navegação entre protótipos
export const PrototypeNavigation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ChatConnect - Protótipos
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prototypes.map((prototype) => (
              <Link
                key={prototype.id}
                to={prototype.path}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {prototype.name}
                </h2>
                <p className="text-gray-600">{prototype.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal que gerencia as rotas
export const PrototypeRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrototypeNavigation />} />
        {prototypes.map((prototype) => (
          <Route
            key={prototype.id}
            path={prototype.path}
            element={
              <div>
                <Link
                  to="/"
                  className="fixed top-4 left-4 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-gray-600"
                >
                  ← Voltar para lista
                </Link>
                <prototype.component />
              </div>
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

const prototypes: Prototype[] = [
  {
    id: 'chat-minimal',
    name: 'Chat Minimal',
    description: 'Versão minimalista do chat',
    component: ChatMinimal,
  },
  {
    id: 'chat-component',
    name: 'Chat Component',
    description: 'Componente base do chat',
    component: ChatComponent,
  },
  {
    id: 'chat-empresarial',
    name: 'Chat Empresarial',
    description: 'Versão empresarial do chat',
    component: ChatEmpresarial,
  },
  {
    id: 'brand-demo',
    name: 'Brand Demo',
    description: 'Demonstração da marca',
    component: BrandDemoComponent,
  },
  {
    id: 'delivery-dashboard',
    name: 'Delivery Dashboard',
    description: 'Dashboard de entregas',
    component: DeliveryDashboard,
  },
  {
    id: 'delivery-call',
    name: 'Delivery Call',
    description: 'Interface de chamada de entrega',
    component: DeliveryCall,
  },
  {
    id: 'delivery-navigation',
    name: 'Delivery Navigation',
    description: 'Navegação do sistema de entregas',
    component: DeliveryNavigation,
  },
  {
    id: 'file-explorer',
    name: 'File Explorer',
    description: 'Explorador de arquivos dinâmico',
    component: FileExplorerDynamic,
  },
  {
    id: 'functional-workflow',
    name: 'Functional Workflow',
    description: 'Fluxo de trabalho funcional',
    component: FunctionalWorkflow,
  },
  {
    id: 'login',
    name: 'Login',
    description: 'Componente de login',
    component: LoginComponent,
  },
];

export default prototypes; 