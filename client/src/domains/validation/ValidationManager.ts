import { 
  ValidationResult, 
  ValidationContext, 
  Document, 
  Schema,
  AnalysisResult,
  Topic,
  Pattern,
  Concern,
  Suggestion,
  ComplexityLevel
} from '../../types';

import { ClaudeService } from '../../services/claude/ClaudeService';
import { SchemaManager } from '../documentation/SchemaManager';

interface ValidationStrategy {
  type: 'structural' | 'contextual' | 'cross_reference';
  confidence: number;
  validations: Array<(context: ValidationContext) => Promise<ValidationResult>>;
}

export class ValidationManager {
  private validationStrategies: ValidationStrategy[] = [
    {
      type: 'structural',
      confidence: 0.8,
      validations: [
        this.validateRequiredFields.bind(this),
        this.validateDataTypes.bind(this),
        this.validateStructuralRules.bind(this)
      ]
    },
    {
      type: 'contextual',
      confidence: 0.7,
      validations: [
        this.validateContextualConsistency.bind(this),
        this.validateDomainRules.bind(this),
        this.validateComplexityAlignment.bind(this)
      ]
    },
    {
      type: 'cross_reference',
      confidence: 0.6,
      validations: [
        this.validateCrossDependencies.bind(this),
        this.validatePhaseProgression.bind(this),
        this.validateCompleteness.bind(this)
      ]
    }
  ];

  constructor(
    private claudeService: ClaudeService,
    private schemaManager: SchemaManager
  ) {}

  async validatePhase(context: ValidationContext): Promise<ValidationResult> {
    try {
      const results: ValidationResult[] = [];

      // Executar todas as estratégias de validação
      for (const strategy of this.validationStrategies) {
        for (const validation of strategy.validations) {
          const result = await validation(context);
          results.push({
            ...result,
            confidence: result.confidence * strategy.confidence
          });
        }
      }

      // Combinar resultados
      return this.combineValidationResults(results);
    } catch (error) {
      console.error('Erro na validação:', error);
      return {
        isValid: false,
        feedback: 'Erro interno durante a validação',
        errors: ['Erro ao executar validações'],
        confidence: 0
      };
    }
  }

  private async validateRequiredFields(context: ValidationContext): Promise<ValidationResult> {
    const schema = await this.schemaManager.getSchema(context.phase);
    const requiredFields = this.extractRequiredFields(schema);
    const missingFields = this.findMissingFields(context.document, requiredFields);

    return {
      isValid: missingFields.length === 0,
      feedback: this.generateFieldsFeedback(missingFields),
      errors: missingFields.map(field => `Campo obrigatório ausente: ${field}`),
      confidence: 1.0
    };
  }

  private async validateDataTypes(context: ValidationContext): Promise<ValidationResult> {
    const schema = await this.schemaManager.getSchema(context.phase);
    const typeErrors = this.validateTypes(context.document, schema);

    return {
      isValid: typeErrors.length === 0,
      feedback: this.generateTypesFeedback(typeErrors),
      errors: typeErrors,
      confidence: 1.0
    };
  }

  private async validateStructuralRules(context: ValidationContext): Promise<ValidationResult> {
    const schema = await this.schemaManager.getSchema(context.phase);
    const structuralErrors = this.validateStructure(context.document, schema);

    return {
      isValid: structuralErrors.length === 0,
      feedback: this.generateStructuralFeedback(structuralErrors),
      errors: structuralErrors,
      confidence: 0.9
    };
  }

  private async validateContextualConsistency(context: ValidationContext): Promise<ValidationResult> {
    const analysis = await this.claudeService.analyzeContext(
      JSON.stringify(context.document),
      {
        projectContext: context.projectContext || {
          id: 'temp',
          name: 'Validação',
          currentPhase: context.phase,
          domainType: 'generic',
          complexity: {
            overall: 'medium',
            factors: {
              technical: 0.5,
              business: 0.5,
              integration: 0.5,
              security: 0.5,
              scale: 0.5
            },
            indicators: []
          }
        },
        conversationContext: context.conversationContext || {
          currentPhase: context.phase,
          conversationHistory: [],
          identifiedTopics: new Set<string>(),
          confidenceLevels: {},
          activeTopics: [],
          pendingQuestions: []
        },
        analysisContext: context.analysisContext || {
          identifiedPatterns: [],
          currentConfidence: {},
          pendingTopics: [],
          suggestedApproaches: []
        }
      }
    );

    const inconsistencies = this.findContextualInconsistencies(analysis);

    return {
      isValid: inconsistencies.length === 0,
      feedback: this.generateContextualFeedback(inconsistencies),
      errors: inconsistencies,
      confidence: 0.8
    };
  }

  private async validateDomainRules(context: ValidationContext): Promise<ValidationResult> {
    const domainRules = await this.getDomainRules(context);
    const violations = this.checkDomainRules(context.document, domainRules);

    return {
      isValid: violations.length === 0,
      feedback: this.generateDomainFeedback(violations),
      errors: violations,
      confidence: 0.7
    };
  }

  private async validateComplexityAlignment(context: ValidationContext): Promise<ValidationResult> {
    const complexityAnalysis = await this.analyzeComplexity(context);
    const misalignments = this.findComplexityMisalignments(complexityAnalysis, context);

    return {
      isValid: misalignments.length === 0,
      feedback: this.generateComplexityFeedback(misalignments),
      errors: misalignments,
      confidence: 0.7
    };
  }

  private async validateCrossDependencies(context: ValidationContext): Promise<ValidationResult> {
    if (!context.previousDocuments?.length) {
      return {
        isValid: true,
        feedback: 'Sem dependências para validar',
        confidence: 1.0
      };
    }

    const dependencies = this.findCrossDependencies(context);
    const violations = this.checkDependencyViolations(dependencies, context);

    return {
      isValid: violations.length === 0,
      feedback: this.generateDependencyFeedback(violations),
      errors: violations,
      confidence: 0.8
    };
  }

  private async validatePhaseProgression(context: ValidationContext): Promise<ValidationResult> {
    const progressionIssues = await this.checkPhaseProgression(context);

    return {
      isValid: progressionIssues.length === 0,
      feedback: this.generateProgressionFeedback(progressionIssues),
      errors: progressionIssues,
      confidence: 0.9
    };
  }

  private async validateCompleteness(context: ValidationContext): Promise<ValidationResult> {
    const completenessIssues = await this.checkCompleteness(context);

    return {
      isValid: completenessIssues.length === 0,
      feedback: this.generateCompletenessFeedback(completenessIssues),
      errors: completenessIssues,
      confidence: 0.8
    };
  }

  // Métodos auxiliares de validação
  private extractRequiredFields(schema: Schema): string[] {
    return schema.required || [];
  }

  private findMissingFields(document: Document, requiredFields: string[]): string[] {
    return requiredFields.filter(field => !this.hasField(document, field));
  }

  private hasField(obj: any, path: string): boolean {
    return path.split('.').every(part => obj && obj[part] !== undefined);
  }

  private validateTypes(document: Document, schema: Schema): string[] {
    // Implementar validação de tipos
    return [];
  }

  private validateStructure(document: Document, schema: Schema): string[] {
    // Implementar validação estrutural
    return [];
  }

  private findContextualInconsistencies(analysis: AnalysisResult): string[] {
    // Implementar busca por inconsistências contextuais
    return [];
  }

  private async getDomainRules(context: ValidationContext): Promise<any[]> {
    // Implementar obtenção de regras do domínio
    return [];
  }

  private checkDomainRules(document: Document, rules: any[]): string[] {
    // Implementar verificação de regras do domínio
    return [];
  }

  private async analyzeComplexity(context: ValidationContext): Promise<ComplexityLevel> {
    // Implementar análise de complexidade
    return {
      overall: 'medium',
      factors: {
        technical: 0.5,
        business: 0.5,
        integration: 0.5,
        security: 0.5,
        scale: 0.5
      },
      indicators: []
    };
  }

  private findComplexityMisalignments(
    complexity: ComplexityLevel,
    context: ValidationContext
  ): string[] {
    // Implementar busca por desalinhamentos de complexidade
    return [];
  }

  private findCrossDependencies(context: ValidationContext): any[] {
    // Implementar busca por dependências cruzadas
    return [];
  }

  private checkDependencyViolations(dependencies: any[], context: ValidationContext): string[] {
    // Implementar verificação de violações de dependência
    return [];
  }

  private async checkPhaseProgression(context: ValidationContext): Promise<string[]> {
    // Implementar verificação de progressão de fase
    return [];
  }

  private async checkCompleteness(context: ValidationContext): Promise<string[]> {
    // Implementar verificação de completude
    return [];
  }

  // Métodos de geração de feedback
  private generateFieldsFeedback(missingFields: string[]): string {
    if (missingFields.length === 0) return 'Todos os campos obrigatórios estão presentes';
    return `Campos obrigatórios ausentes: ${missingFields.join(', ')}`;
  }

  private generateTypesFeedback(errors: string[]): string {
    if (errors.length === 0) return 'Todos os tipos estão corretos';
    return `Erros de tipo encontrados: ${errors.join(', ')}`;
  }

  private generateStructuralFeedback(errors: string[]): string {
    if (errors.length === 0) return 'Estrutura do documento está correta';
    return `Problemas estruturais encontrados: ${errors.join(', ')}`;
  }

  private generateContextualFeedback(inconsistencies: string[]): string {
    if (inconsistencies.length === 0) return 'Documento está contextualmente consistente';
    return `Inconsistências encontradas: ${inconsistencies.join(', ')}`;
  }

  private generateDomainFeedback(violations: string[]): string {
    if (violations.length === 0) return 'Documento segue todas as regras do domínio';
    return `Violações de regras do domínio: ${violations.join(', ')}`;
  }

  private generateComplexityFeedback(misalignments: string[]): string {
    if (misalignments.length === 0) return 'Complexidade está alinhada com o esperado';
    return `Desalinhamentos de complexidade: ${misalignments.join(', ')}`;
  }

  private generateDependencyFeedback(violations: string[]): string {
    if (violations.length === 0) return 'Todas as dependências estão satisfeitas';
    return `Violações de dependência: ${violations.join(', ')}`;
  }

  private generateProgressionFeedback(issues: string[]): string {
    if (issues.length === 0) return 'Progressão de fase está adequada';
    return `Problemas na progressão: ${issues.join(', ')}`;
  }

  private generateCompletenessFeedback(issues: string[]): string {
    if (issues.length === 0) return 'Documento está completo';
    return `Problemas de completude: ${issues.join(', ')}`;
  }

  private combineValidationResults(results: ValidationResult[]): ValidationResult {
    const isValid = results.every(r => r.isValid);
    const errors = results.flatMap(r => r.errors || []);
    const warnings = results.flatMap(r => r.warnings || []);
    const confidence = this.calculateAverageConfidence(results);

    return {
      isValid,
      feedback: this.generateCombinedFeedback(results),
      errors,
      warnings,
      confidence
    };
  }

  private calculateAverageConfidence(results: ValidationResult[]): number {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + (r.confidence || 0), 0);
    return sum / results.length;
  }

  private generateCombinedFeedback(results: ValidationResult[]): string {
    const validations = results.length;
    const passed = results.filter(r => r.isValid).length;
    const confidence = this.calculateAverageConfidence(results);

    return `Validações concluídas: ${passed}/${validations}
Confiança geral: ${(confidence * 100).toFixed(1)}%
${this.summarizeIssues(results)}`;
  }

  private summarizeIssues(results: ValidationResult[]): string {
    const issues = results
      .filter(r => !r.isValid)
      .map(r => r.feedback)
      .join('\n');

    return issues || 'Nenhum problema encontrado';
  }
} 