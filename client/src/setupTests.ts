import '@testing-library/jest-dom';

// Silencia warnings do React 18
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning/.test(args[0])) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 