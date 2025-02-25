import { ErrorHandler } from './handler.interface';
import { CacheStrategy } from './cache.interface';
import { Validator } from './validator.interface';

export interface ServiceConfig {
    validators?: Validator<unknown>[];
    errorHandler?: ErrorHandler;
    cache?: CacheStrategy<unknown>;
    [key: string]: unknown;
}

export interface ServiceMetrics {
    requestCount: number;
    errorCount: number;
    cacheHits: number;
    cacheMisses: number;
    averageResponseTime: number;
}

export interface ServiceHealth {
    isHealthy: boolean;
    lastCheck: Date;
    metrics: ServiceMetrics;
    errors?: string[];
}

export interface BaseService {
    getConfig(): ServiceConfig;
    getMetrics(): ServiceMetrics;
    getHealth(): ServiceHealth;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
} 