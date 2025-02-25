import { jest } from '@jest/globals';

// Aumentar timeout global
jest.setTimeout(30000);

// Configuração global para timers
beforeAll(() => {
    jest.useFakeTimers();
});

// Limpar estado entre testes
beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
});

// Limpar todos os mocks e timers após cada teste
afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Limpar todos os event listeners pendentes
    process.removeAllListeners();
});

// Restaurar timers e limpar tudo após cada arquivo de teste
afterAll(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Forçar coleta de lixo
    if (global.gc) {
        global.gc();
    }
}); 