import { 
    Document,
    DocumentSection,
    DocumentVersion,
    DocumentExportOptions,
    DocumentValidationResult,
    DocumentationService
} from '../types';

export class DocumentationServiceImpl implements DocumentationService {
    private documents: Map<string, Document> = new Map();
    private versions: Map<string, DocumentVersion[]> = new Map();

    async createDocument(projectId: string, phase: string, template?: string): Promise<Document> {
        const document: Document = {
            id: Date.now().toString(),
            projectId,
            phase: phase as 'DVP' | 'DRS' | 'DAS' | 'DADI',
            title: `${phase} - ${new Date().toISOString().split('T')[0]}`,
            sections: [],
            versions: [],
            currentVersion: '1.0.0',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            status: {
                isComplete: false,
                progress: 0,
                lastUpdate: new Date()
            },
            metadata: {
                schema: template || 'default',
                template: template
            }
        };

        this.documents.set(document.id, document);
        return document;
    }

    async getDocument(id: string): Promise<Document> {
        const document = this.documents.get(id);
        if (!document) {
            throw new Error('Documento não encontrado');
        }
        return document;
    }

    async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
        const document = await this.getDocument(id);
        
        const updatedDocument = {
            ...document,
            ...updates,
            updatedAt: new Date(),
            version: document.version + 1,
            status: {
                ...document.status,
                lastUpdate: new Date()
            }
        };

        this.documents.set(id, updatedDocument);
        return updatedDocument;
    }

    async deleteDocument(id: string): Promise<boolean> {
        const exists = this.documents.has(id);
        if (!exists) {
            throw new Error('Documento não encontrado');
        }

        this.documents.delete(id);
        this.versions.delete(id);
        return true;
    }

    async addSection(documentId: string, section: Partial<DocumentSection>): Promise<Document> {
        const document = await this.getDocument(documentId);
        
        const newSection: DocumentSection = {
            id: Date.now().toString(),
            title: section.title || '',
            content: section.content || '',
            order: section.order || document.sections.length + 1,
            status: section.status || 'draft',
            metadata: section.metadata
        };

        const updatedDocument = {
            ...document,
            sections: [...document.sections, newSection],
            updatedAt: new Date(),
            version: document.version + 1,
            status: {
                ...document.status,
                lastUpdate: new Date(),
                progress: this.calculateProgress([...document.sections, newSection])
            }
        };

        this.documents.set(documentId, updatedDocument);
        return updatedDocument;
    }

    async updateSection(documentId: string, sectionId: string, updates: Partial<DocumentSection>): Promise<Document> {
        const document = await this.getDocument(documentId);
        
        const sectionIndex = document.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) {
            throw new Error('Seção não encontrada');
        }

        const updatedSections = [...document.sections];
        updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            ...updates
        };

        const updatedDocument = {
            ...document,
            sections: updatedSections,
            updatedAt: new Date(),
            version: document.version + 1,
            status: {
                ...document.status,
                lastUpdate: new Date(),
                progress: this.calculateProgress(updatedSections)
            }
        };

        this.documents.set(documentId, updatedDocument);
        return updatedDocument;
    }

    async removeSection(documentId: string, sectionId: string): Promise<Document> {
        const document = await this.getDocument(documentId);
        
        const updatedSections = document.sections.filter(s => s.id !== sectionId);
        
        const updatedDocument = {
            ...document,
            sections: updatedSections,
            updatedAt: new Date(),
            version: document.version + 1,
            status: {
                ...document.status,
                lastUpdate: new Date(),
                progress: this.calculateProgress(updatedSections)
            }
        };

        this.documents.set(documentId, updatedDocument);
        return updatedDocument;
    }

    async createVersion(documentId: string, changes: string[]): Promise<DocumentVersion> {
        const document = await this.getDocument(documentId);
        
        const version: DocumentVersion = {
            version: this.generateVersionNumber(document),
            createdAt: new Date(),
            sections: [...document.sections],
            changes,
            author: 'system' // TODO: Implementar autenticação
        };

        const versions = this.versions.get(documentId) || [];
        this.versions.set(documentId, [...versions, version]);

        await this.updateDocument(documentId, {
            currentVersion: version.version
        });

        return version;
    }

    async getVersion(documentId: string, version: string): Promise<DocumentVersion> {
        const versions = this.versions.get(documentId);
        if (!versions) {
            throw new Error('Nenhuma versão encontrada para este documento');
        }

        const documentVersion = versions.find(v => v.version === version);
        if (!documentVersion) {
            throw new Error('Versão não encontrada');
        }

        return documentVersion;
    }

    async listVersions(documentId: string): Promise<DocumentVersion[]> {
        return this.versions.get(documentId) || [];
    }

    async exportDocument(documentId: string, options: DocumentExportOptions): Promise<Buffer> {
        const document = await this.getDocument(documentId);
        
        // TODO: Implementar exportação real
        const content = JSON.stringify(document, null, 2);
        return Buffer.from(content);
    }

    async validateDocument(documentId: string): Promise<DocumentValidationResult> {
        const document = await this.getDocument(documentId);
        
        const errors = [];
        const warnings = [];
        const suggestions = [];

        // Validar seções obrigatórias
        if (document.sections.length === 0) {
            errors.push({
                section: 'geral',
                field: 'sections',
                message: 'Documento deve ter pelo menos uma seção',
                severity: 'error' as const
            });
        }

        // Validar conteúdo das seções
        for (const section of document.sections) {
            if (!section.title) {
                errors.push({
                    section: section.id,
                    field: 'title',
                    message: 'Título da seção é obrigatório',
                    severity: 'error' as const
                });
            }

            if (!section.content) {
                warnings.push(`Seção ${section.title} está vazia`);
            }

            if (section.content && section.content.length < 100) {
                suggestions.push(`Considere expandir o conteúdo da seção ${section.title}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }

    async validateSection(documentId: string, sectionId: string): Promise<DocumentValidationResult> {
        const document = await this.getDocument(documentId);
        const section = document.sections.find(s => s.id === sectionId);
        
        if (!section) {
            throw new Error('Seção não encontrada');
        }

        const errors = [];
        const warnings = [];
        const suggestions = [];

        // Validar campos obrigatórios
        if (!section.title || section.title.trim() === '') {
            errors.push({
                section: sectionId,
                field: 'title',
                message: 'Título da seção é obrigatório',
                severity: 'error' as const
            });
        }

        // Validar conteúdo
        if (!section.content || section.content.trim() === '') {
            warnings.push('Seção está vazia');
        } else if (section.content.length < 100) {
            suggestions.push('Considere expandir o conteúdo da seção');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }

    private calculateProgress(sections: DocumentSection[]): number {
        if (sections.length === 0) return 0;

        const completedSections = sections.filter(s => s.status === 'approved').length;
        return Math.round((completedSections / sections.length) * 100);
    }

    private generateVersionNumber(document: Document): string {
        const versions = this.versions.get(document.id) || [];
        if (versions.length === 0) return '1.0.0';

        const lastVersion = versions[versions.length - 1].version;
        const [major, minor, patch] = lastVersion.split('.').map(Number);
        return `${major}.${minor}.${patch + 1}`;
    }
} 