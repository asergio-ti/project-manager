/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@server/(.*)$': '<rootDir>/src/$1',
    '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
    '^@types/(.*)$': '<rootDir>/src/domains/types/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}; 