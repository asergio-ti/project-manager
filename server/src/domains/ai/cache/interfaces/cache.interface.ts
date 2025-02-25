export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
}

export interface CacheStrategy<T> {
    get(key: string): Promise<CacheEntry<T> | undefined>;
    set(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}

export interface CacheConfig {
    maxSize?: number;
    defaultTTL?: number;
    cleanupInterval?: number;
} 