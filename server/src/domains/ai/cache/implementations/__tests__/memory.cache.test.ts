import { MemoryCache } from '../memory.cache';

describe('MemoryCache', () => {
    let cache: MemoryCache<string>;

    beforeEach(() => {
        cache = new MemoryCache({
            maxSize: 2,
            defaultTTL: 100,
            cleanupInterval: 50
        });
    });

    describe('operações básicas', () => {
        it('deve armazenar e recuperar um valor', async () => {
            await cache.set('key1', 'value1');
            const result = await cache.get('key1');
            expect(result?.value).toBe('value1');
        });

        it('deve verificar se uma chave existe', async () => {
            await cache.set('key1', 'value1');
            expect(await cache.has('key1')).toBe(true);
            expect(await cache.has('key2')).toBe(false);
        });

        it('deve deletar uma chave', async () => {
            await cache.set('key1', 'value1');
            await cache.delete('key1');
            expect(await cache.has('key1')).toBe(false);
        });

        it('deve limpar todo o cache', async () => {
            await cache.set('key1', 'value1');
            await cache.set('key2', 'value2');
            await cache.clear();
            expect(await cache.has('key1')).toBe(false);
            expect(await cache.has('key2')).toBe(false);
        });
    });

    describe('TTL e limpeza', () => {
        it('deve expirar itens após TTL', async () => {
            await cache.set('key1', 'value1', 50);
            expect((await cache.get('key1'))?.value).toBe('value1');
            
            await new Promise(resolve => setTimeout(resolve, 60));
            expect(await cache.get('key1')).toBeUndefined();
        });

        it('deve respeitar o TTL padrão', async () => {
            await cache.set('key1', 'value1');
            expect((await cache.get('key1'))?.value).toBe('value1');
            
            await new Promise(resolve => setTimeout(resolve, 110));
            expect(await cache.get('key1')).toBeUndefined();
        });
    });

    describe('tamanho máximo', () => {
        it('deve remover item mais antigo quando atingir tamanho máximo', async () => {
            await cache.set('key1', 'value1');
            await cache.set('key2', 'value2');
            await cache.set('key3', 'value3');

            expect(await cache.get('key1')).toBeUndefined();
            expect((await cache.get('key2'))?.value).toBe('value2');
            expect((await cache.get('key3'))?.value).toBe('value3');
        });
    });
}); 