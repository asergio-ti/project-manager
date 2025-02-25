/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  testTimeout: 30000,
  maxWorkers: '50%',
  maxConcurrency: 1,
  fakeTimers: {
    enableGlobally: true,
    advanceTimers: true,
    now: 0
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts']
}; 