import { DocumentationServiceImpl } from '../documentation.service';
import { Document, DocumentSection, DocumentVersion } from '../../types';

describe('DocumentationService', () => {
    let service: DocumentationServiceImpl;
    const mockProjectId = 'project-123';
    const mockPhase = 'DVP';

    beforeEach(() => {
        service = new DocumentationServiceImpl();
    });

    describe('createDocument', () => {
        it('deve criar um novo documento com os campos obrigatórios', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);

            expect(document).toBeDefined();
            expect(document.projectId).toBe(mockProjectId);
            expect(document.phase).toBe(mockPhase);
            expect(document.sections).toEqual([]);
            expect(document.versions).toEqual([]);
            expect(document.currentVersion).toBe('1.0.0');
            expect(document.status.isComplete).toBe(false);
            expect(document.status.progress).toBe(0);
        });

        it('deve criar um documento com template quando especificado', async () => {
            const template = 'custom-template';
            const document = await service.createDocument(mockProjectId, mockPhase, template);

            expect(document.metadata.template).toBe(template);
            expect(document.metadata.schema).toBe(template);
        });
    });

    describe('getDocument', () => {
        it('deve retornar um documento existente', async () => {
            const created = await service.createDocument(mockProjectId, mockPhase);
            const document = await service.getDocument(created.id);

            expect(document).toBeDefined();
            expect(document.id).toBe(created.id);
        });

        it('deve lançar erro quando documento não existe', async () => {
            await expect(service.getDocument('invalid-id'))
                .rejects
                .toThrow('Documento não encontrado');
        });
    });

    describe('updateDocument', () => {
        it('deve atualizar campos do documento', async () => {
            const created = await service.createDocument(mockProjectId, mockPhase);
            const updates = {
                title: 'Novo Título',
                description: 'Nova Descrição'
            };

            const updated = await service.updateDocument(created.id, updates);

            expect(updated.title).toBe(updates.title);
            expect(updated.description).toBe(updates.description);
            expect(updated.version).toBe(created.version + 1);
            expect(updated.updatedAt).not.toBe(created.updatedAt);
        });

        it('deve lançar erro ao atualizar documento inexistente', async () => {
            await expect(service.updateDocument('invalid-id', {}))
                .rejects
                .toThrow('Documento não encontrado');
        });
    });

    describe('addSection', () => {
        it('deve adicionar uma nova seção ao documento', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const section: Partial<DocumentSection> = {
                title: 'Nova Seção',
                content: 'Conteúdo da seção'
            };

            const updated = await service.addSection(document.id, section);

            expect(updated.sections).toHaveLength(1);
            expect(updated.sections[0].title).toBe(section.title);
            expect(updated.sections[0].content).toBe(section.content);
            expect(updated.sections[0].status).toBe('draft');
        });

        it('deve calcular ordem correta para nova seção', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            
            const section1 = await service.addSection(document.id, { title: 'Seção 1' });
            const section2 = await service.addSection(section1.id, { title: 'Seção 2' });

            expect(section2.sections[1].order).toBe(2);
        });
    });

    describe('updateSection', () => {
        it('deve atualizar uma seção existente', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const added = await service.addSection(document.id, { title: 'Seção Original' });
            const sectionId = added.sections[0].id;

            const updates = {
                title: 'Seção Atualizada',
                content: 'Novo conteúdo',
                status: 'review' as const
            };

            const updated = await service.updateSection(document.id, sectionId, updates);
            const section = updated.sections[0];

            expect(section.title).toBe(updates.title);
            expect(section.content).toBe(updates.content);
            expect(section.status).toBe(updates.status);
        });

        it('deve lançar erro ao atualizar seção inexistente', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);

            await expect(service.updateSection(document.id, 'invalid-section', {}))
                .rejects
                .toThrow('Seção não encontrada');
        });
    });

    describe('createVersion', () => {
        it('deve criar uma nova versão do documento', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const changes = ['Alteração 1', 'Alteração 2'];

            const version = await service.createVersion(document.id, changes);

            expect(version.version).toBe('1.0.0');
            expect(version.changes).toEqual(changes);
            expect(version.sections).toEqual(document.sections);
        });

        it('deve incrementar número da versão corretamente', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            
            const version1 = await service.createVersion(document.id, ['Mudança 1']);
            const version2 = await service.createVersion(document.id, ['Mudança 2']);

            expect(version1.version).toBe('1.0.0');
            expect(version2.version).toBe('1.0.1');
        });
    });

    describe('validateDocument', () => {
        it('deve validar documento vazio', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const result = await service.validateDocument(document.id);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].message).toContain('pelo menos uma seção');
        });

        it('deve validar documento com seções', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            await service.addSection(document.id, {
                title: 'Seção 1',
                content: 'Conteúdo completo da seção com mais de 100 caracteres para garantir que não gere warnings de conteúdo muito curto no processo de validação.'
            });

            const result = await service.validateDocument(document.id);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it('deve gerar warnings para seções vazias', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            await service.addSection(document.id, {
                title: 'Seção Vazia'
            });

            const result = await service.validateDocument(document.id);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toContain('está vazia');
        });
    });

    describe('calculateProgress', () => {
        it('deve calcular 0% para documento sem seções', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            expect(document.status.progress).toBe(0);
        });

        it('deve calcular progresso baseado em seções aprovadas', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            
            // Adicionar 4 seções
            await service.addSection(document.id, { title: 'Seção 1', status: 'draft' });
            const doc = await service.addSection(document.id, { title: 'Seção 2', status: 'review' });
            await service.addSection(doc.id, { title: 'Seção 3', status: 'approved' });
            const final = await service.addSection(doc.id, { title: 'Seção 4', status: 'approved' });

            // 2 de 4 seções aprovadas = 50%
            expect(final.status.progress).toBe(50);
        });
    });

    describe('deleteDocument', () => {
        it('deve excluir um documento existente', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const result = await service.deleteDocument(document.id);

            expect(result).toBe(true);
            await expect(service.getDocument(document.id))
                .rejects
                .toThrow('Documento não encontrado');
        });

        it('deve excluir também as versões do documento', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            await service.createVersion(document.id, ['Mudança 1']);
            await service.deleteDocument(document.id);

            const versions = await service.listVersions(document.id);
            expect(versions).toHaveLength(0);
        });

        it('deve lançar erro ao tentar excluir documento inexistente', async () => {
            await expect(service.deleteDocument('invalid-id'))
                .rejects
                .toThrow('Documento não encontrado');
        });
    });

    describe('listVersions', () => {
        it('deve retornar lista vazia para documento sem versões', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const versions = await service.listVersions(document.id);
            expect(versions).toEqual([]);
        });

        it('deve retornar todas as versões em ordem', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            
            await service.createVersion(document.id, ['Mudança 1']);
            await service.createVersion(document.id, ['Mudança 2']);
            await service.createVersion(document.id, ['Mudança 3']);

            const versions = await service.listVersions(document.id);
            
            expect(versions).toHaveLength(3);
            expect(versions[0].version).toBe('1.0.0');
            expect(versions[1].version).toBe('1.0.1');
            expect(versions[2].version).toBe('1.0.2');
        });
    });

    describe('validateSection', () => {
        it('deve validar uma seção específica', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const withSection = await service.addSection(document.id, {
                title: 'Seção de Teste',
                content: 'Conteúdo curto'
            });

            const result = await service.validateSection(document.id, withSection.sections[0].id);

            expect(result.isValid).toBe(true);
            expect(result.suggestions).toHaveLength(1);
            expect(result.suggestions[0]).toContain('expandir o conteúdo');
        });

        it('deve lançar erro para seção inexistente', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);

            await expect(service.validateSection(document.id, 'invalid-section'))
                .rejects
                .toThrow('Seção não encontrada');
        });

        it('deve validar seção sem título', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            const withSection = await service.addSection(document.id, {
                content: 'Apenas conteúdo'
            });

            const result = await service.validateSection(document.id, withSection.sections[0].id);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].message).toContain('Título da seção é obrigatório');
        });
    });

    describe('exportDocument', () => {
        it('deve exportar documento em formato JSON', async () => {
            const document = await service.createDocument(mockProjectId, mockPhase);
            await service.addSection(document.id, {
                title: 'Seção 1',
                content: 'Conteúdo da seção'
            });

            const options = {
                format: 'json' as any,
                includeMetadata: true
            };

            const buffer = await service.exportDocument(document.id, options);
            const exported = JSON.parse(buffer.toString());

            expect(exported.id).toBe(document.id);
            expect(exported.sections).toHaveLength(1);
            expect(exported.metadata).toBeDefined();
        });

        it('deve lançar erro ao exportar documento inexistente', async () => {
            const options = {
                format: 'pdf' as const,
                includeMetadata: true
            };

            await expect(service.exportDocument('invalid-id', options))
                .rejects
                .toThrow('Documento não encontrado');
        });
    });
}); 