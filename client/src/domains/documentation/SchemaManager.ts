// Gestão de schemas

import { DocumentPhase, Schema } from '../../types';

export class SchemaManager {
  private schemaMap: Record<DocumentPhase, string> = {
    DVP: 'schemas/dvp/vision-schema.json',
    DRS: 'schemas/drs/requirements-schema.json',
    DAS: 'schemas/das/architectural-decisions-schema.json',
    DADI: 'schemas/dadi/api-schema.json'
  };

  private schemaCache: Map<DocumentPhase, Schema> = new Map();

  async getSchema(phase: DocumentPhase): Promise<Schema> {
    // Verificar cache primeiro
    const cached = this.schemaCache.get(phase);
    if (cached) {
      return cached;
    }

    // Carregar schema do arquivo
    const schema = await this.loadSchema(phase);
    this.schemaCache.set(phase, schema);
    return schema;
  }

  async update(phase: DocumentPhase, data: any): Promise<void> {
    const schema = await this.getSchema(phase);
    const updatedSchema = this.mergeData(schema, data);
    await this.saveSchema(phase, updatedSchema);
    
    // Atualizar cache
    this.schemaCache.set(phase, updatedSchema);
  }

  private async loadSchema(phase: DocumentPhase): Promise<Schema> {
    try {
      const schemaPath = this.schemaMap[phase];
      const response = await fetch(schemaPath);
      if (!response.ok) {
        throw new Error(`Erro ao carregar schema: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao carregar schema para fase ${phase}:`, error);
      throw error;
    }
  }

  private mergeData(schema: Schema, data: any): Schema {
    try {
      // Criar cópia profunda do schema
      const merged = JSON.parse(JSON.stringify(schema));

      // Mesclar propriedades
      for (const [key, value] of Object.entries(data)) {
        if (merged.properties[key]) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            merged.properties[key] = this.mergeProperties(
              merged.properties[key],
              value
            );
          } else {
            merged.properties[key] = value;
          }
        }
      }

      // Atualizar campos required se necessário
      if (data.required) {
        merged.required = Array.from(new Set([...merged.required, ...data.required]));
      }

      return merged;
    } catch (error) {
      console.error('Erro ao mesclar dados com schema:', error);
      throw error;
    }
  }

  private mergeProperties(original: any, update: any): any {
    const merged = { ...original };

    for (const [key, value] of Object.entries(update)) {
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        original[key] &&
        typeof original[key] === 'object'
      ) {
        merged[key] = this.mergeProperties(original[key], value);
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  private async saveSchema(phase: DocumentPhase, schema: Schema): Promise<void> {
    try {
      const schemaPath = this.schemaMap[phase];
      // Implementar salvamento do schema (pode variar dependendo da infraestrutura)
      console.log(`Schema atualizado para fase ${phase}:`, schema);
    } catch (error) {
      console.error(`Erro ao salvar schema para fase ${phase}:`, error);
      throw error;
    }
  }

  // Métodos auxiliares para validação de schema
  async validateSchemaStructure(schema: Schema): Promise<boolean> {
    // Implementar validação da estrutura do schema
    return true;
  }

  async validateSchemaConsistency(phase: DocumentPhase, schema: Schema): Promise<boolean> {
    // Implementar validação de consistência do schema com outros schemas
    return true;
  }
}
