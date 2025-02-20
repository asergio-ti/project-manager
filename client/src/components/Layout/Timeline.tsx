// Timeline do projeto

import React from 'react';

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

const Timeline: React.FC = () => {
  const phases: Phase[] = [
    {
      id: 'dvp',
      name: 'DVP - Documentação de Visão e Proposta',
      status: 'completed',
      documents: [
        { schema: 'Visão', completion: 100, status: 'completed' },
        { schema: 'Análise de Mercado', completion: 100, status: 'completed' },
        { schema: 'Modelo de Negócio', completion: 100, status: 'completed' }
      ]
    },
    {
      id: 'drs',
      name: 'DRS - Documento de Requisitos',
      status: 'in_progress',
      documents: [
        { schema: 'Requisitos Funcionais', completion: 60, status: 'in_progress' },
        { schema: 'Requisitos Não Funcionais', completion: 40, status: 'in_progress' },
        { schema: 'Regras de Negócio', completion: 20, status: 'in_progress' }
      ]
    },
    {
      id: 'das',
      name: 'DAS - Documento de Arquitetura',
      status: 'pending',
      documents: [
        { schema: 'Visão Arquitetural', completion: 0, status: 'pending' },
        { schema: 'Decisões Técnicas', completion: 0, status: 'pending' },
        { schema: 'Componentes', completion: 0, status: 'pending' }
      ]
    }
  ];

  return (
    <div className="h-full bg-card rounded-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-card-foreground">Timeline do Projeto</h2>
      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`p-4 rounded-lg border ${
              phase.status === 'completed'
                ? 'bg-primary/10 border-primary'
                : phase.status === 'in_progress'
                ? 'bg-accent/10 border-accent'
                : 'bg-muted border-border'
            }`}
          >
            <h3 className="font-semibold text-card-foreground mb-2">{phase.name}</h3>
            <div className="space-y-2">
              {phase.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{doc.schema}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${doc.completion}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {doc.completion}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
