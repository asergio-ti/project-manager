import { BaseDocument } from '../../types/core';

export interface DocumentSection {
    id: string;
    title: string;
    content: string;
    order: number;
    status: 'draft' | 'review' | 'approved';
    metadata?: Record<string, any>;
}

export interface DocumentVersion {
    version: string;
    createdAt: Date;
    sections: DocumentSection[];
    changes: string[];
    author: string;
}

export interface Document extends BaseDocument {
    projectId: string;
    phase: 'DVP' | 'DRS' | 'DAS' | 'DADI';
    title: string;
    description?: string;
    sections: DocumentSection[];
    versions: DocumentVersion[];
    currentVersion: string;
    status: DocumentStatus;
    metadata: DocumentMetadata;
}

export interface DocumentStatus {
    isComplete: boolean;
    progress: number;
    lastUpdate: Date;
    reviewedBy?: string[];
    approvedBy?: string;
    approvedAt?: Date;
}

export interface DocumentMetadata {
    schema: string;
    template?: string;
    tags?: string[];
    relatedDocuments?: string[];
    customFields?: Record<string, any>;
}

export interface DocumentTemplate {
    id: string;
    name: string;
    description?: string;
    phase: 'DVP' | 'DRS' | 'DAS' | 'DADI';
    sections: Array<{
        title: string;
        description?: string;
        required: boolean;
        order: number;
        schema?: string;
    }>;
    metadata: {
        version: string;
        createdAt: Date;
        updatedAt: Date;
        author: string;
    };
}

export interface DocumentExportOptions {
    format: 'pdf' | 'html' | 'markdown' | 'word';
    includeMetadata: boolean;
    includeSections?: string[];
    styleTemplate?: string;
    watermark?: string;
}

export interface DocumentValidationResult {
    isValid: boolean;
    errors: Array<{
        section: string;
        field: string;
        message: string;
        severity: 'error' | 'warning' | 'info';
    }>;
    warnings: string[];
    suggestions: string[];
}

export interface DocumentationService {
    // Operações básicas
    createDocument(projectId: string, phase: string, template?: string): Promise<Document>;
    getDocument(id: string): Promise<Document>;
    updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
    deleteDocument(id: string): Promise<boolean>;
    
    // Operações de seção
    addSection(documentId: string, section: Partial<DocumentSection>): Promise<Document>;
    updateSection(documentId: string, sectionId: string, updates: Partial<DocumentSection>): Promise<Document>;
    removeSection(documentId: string, sectionId: string): Promise<Document>;
    
    // Versionamento
    createVersion(documentId: string, changes: string[]): Promise<DocumentVersion>;
    getVersion(documentId: string, version: string): Promise<DocumentVersion>;
    listVersions(documentId: string): Promise<DocumentVersion[]>;
    
    // Exportação
    exportDocument(documentId: string, options: DocumentExportOptions): Promise<Buffer>;
    
    // Validação
    validateDocument(documentId: string): Promise<DocumentValidationResult>;
    validateSection(documentId: string, sectionId: string): Promise<DocumentValidationResult>;
} 