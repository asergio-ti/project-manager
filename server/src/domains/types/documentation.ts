import { BaseDocument } from './core';

export interface DocumentMetadata {
    schema: string;
    version: string;
    description: string;
    examples: any[];
}

export interface DocumentTemplate extends BaseDocument {
    metadata: DocumentMetadata;
    content: any;
}

export interface DocumentationService {
    generateDocumentation(document: DocumentTemplate): Promise<string>;
    validateDocumentation(document: DocumentTemplate): Promise<boolean>;
}

export interface DocumentationConfig {
    outputFormat: 'html' | 'markdown' | 'pdf';
    includeExamples: boolean;
    includeMetadata: boolean;
} 