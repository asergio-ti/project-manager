import { BaseDocument } from '../../types/core';

export interface Project extends BaseDocument {
    name: string;
    description?: string;
    phases: {
        dvp: PhaseState;
        drs: PhaseState;
        das: PhaseState;
        dadi: PhaseState;
    };
    status: ProjectStatus;
    metadata: ProjectMetadata;
}

export interface PhaseState {
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
    progress: number;
    completedFields: string[];
    pendingFields: string[];
    lastUpdate: Date;
}

export interface ProjectStatus {
    currentPhase: 'DVP' | 'DRS' | 'DAS' | 'DADI';
    overallProgress: number;
    startDate: Date;
    lastActivity: Date;
}

export interface ProjectMetadata {
    createdBy: string;
    team?: string[];
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    deadline?: Date;
} 