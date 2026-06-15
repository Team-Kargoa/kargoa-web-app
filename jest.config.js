const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/layout.tsx',
    '!app/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 99.99,
      functions: 99.99,
      lines: 99.99,
      statements: 99.99,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
