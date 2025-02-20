export type DocumentStatus = 'pending' | 'in_progress' | 'completed';

export interface Document {
  schema: string;
  completion: number;
  status: DocumentStatus;
}

export interface Phase {
  id: string;
  name: string;
  status: DocumentStatus;
  documents: Document[];
}

export interface TimelineState {
  currentPhase: string;
  phases: {
    [key: string]: {
      status: DocumentStatus;
      completedDocuments: string[];
    };
  };
}

export interface ProgressState {
  overall: number;
  phases: {
    [key: string]: {
      progress: number;
      documents: {
        [key: string]: number;
      };
    };
  };
} 