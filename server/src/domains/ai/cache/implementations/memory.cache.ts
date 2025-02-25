import { CacheEntry, CacheStrategy, CacheConfig } from '../interfaces/cache.interface';

export class MemoryCache<T> implements CacheStrategy<T> {
    private cache: Map<string, CacheEntry<T>>;
    private config: Required<CacheConfig>;

    constructor(config: CacheConfig = {}) {
        this.cache = new Map();
        this.config = {
            maxSize: config.maxSize || 1000,
            defaultTTL: config.defaultTTL || 3600000, // 1 hora
            cleanupInterval: config.cleanupInterval || 300000 // 5 minutos
        };

        this.startCleanupInterval();
    }

    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now >= entry.timestamp + entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    async get(key: string): Promise<CacheEntry<T> | undefined> {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (Date.now() >= entry.timestamp + entry.ttl) {
            this.cache.delete(key);
            return undefined;
        }

        return entry;
    }

    async set(key: string, value: T, ttl?: number): Promise<void> {
        if (this.cache.size >= this.config.maxSize) {
            // Remove o item mais antigo se atingir o tamanho máximo
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl: ttl || this.config.defaultTTL
        });
    }

    async has(key: string): Promise<boolean> {
        const entry = await this.get(key);
        return entry !== undefined;
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }
} 