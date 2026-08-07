import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
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

export default createJestConfig(customJestConfig);
